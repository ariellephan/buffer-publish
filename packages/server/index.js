const http = require('http');
const express = require('express');
const logMiddleware = require('@bufferapp/logger/middleware');
const bugsnag = require('bugsnag');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const { join } = require('path');
const shutdownHelper = require('@bufferapp/shutdown-helper');
const { apiError } = require('./middleware');
const {
  setRequestSession,
  validateSession,
} = require('@bufferapp/session-manager/middleware');
const controller = require('./lib/controller');
const rpc = require('./rpc');
const pusher = require('./lib/pusher');


const app = express();
const server = http.createServer(app);

let staticAssets = {
  // 'bundle.js': '/static/bundle.js',
  'bundle.js': 'https://local.buffer.com:8080/static/bundle.js',
  'composer-bundle.css': 'https://local.buffer.com:8080/static/composer-bundle.css',
};

// NOTE: Bugsnag will not notify in local setup with current weback configuration
// https://docs.bugsnag.com/platforms/browsers/faq/#4-code-generated-with-eval-e-g-from-webpack
let bugsnagScript = '';

const isProduction = process.env.NODE_ENV === 'production';
app.set('isProduction', isProduction);

if (isProduction) {
  staticAssets = JSON.parse(fs.readFileSync(join(__dirname, 'staticAssets.json'), 'utf8'));
  if (process.env.BUGSNAG_KEY) {
    bugsnag.register(process.env.BUGSNAG_KEY);
    app.set('bugsnag', bugsnag);
    // NOTE: Bugsnag will not notify in local setup with current weback configuration
    // https://docs.bugsnag.com/platforms/browsers/faq/#4-code-generated-with-eval-e-g-from-webpack
    bugsnagScript = `<script src="//d2wy8f7a9ursnm.cloudfront.net/bugsnag-3.min.js"
                              data-apikey="${process.env.BUGSNAG_KEY}"></script>`;
  }
}

const fullStoryScript = `<script>
window['_fs_debug'] = false;
window['_fs_host'] = 'fullstory.com';
window['_fs_org'] = '9F6GW';
window['_fs_namespace'] = 'FS';
(function(m,n,e,t,l,o,g,y){
  if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');} return;}
  g=m[e]=function(a,b){g.q?g.q.push([a,b]):g._api(a,b);};g.q=[];
  o=n.createElement(t);o.async=1;o.src='https://'+_fs_host+'/s/fs.js';
  y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
  g.identify=function(i,v){g(l,{uid:i});if(v)g(l,v)};g.setUserVars=function(v){g(l,v)};
  g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
  g.clearUserCookie=function(c,d,i){if(!c || document.cookie.match('fs_uid=[\`;\`]*\`[\`;\`]*\`[\`;\`]*\`')){
  d=n.domain;while(1){n.cookie='fs_uid=;domain='+d+
  ';path=/;expires='+new Date(0).toUTCString();i=d.indexOf('.');if(i<0)break;d=d.slice(i+1)}}};
})(window,document,window['_fs_namespace'],'script','user');
</script>`;

const getHtml = () => fs.readFileSync(join(__dirname, 'index.html'), 'utf8')
                                    .replace('{{{bundle}}}', staticAssets['bundle.js'])
                                    .replace('{{{composer-css-bundle}}}', staticAssets['composer-bundle.css'])
                                    .replace('{{{bugsnagScript}}}', bugsnagScript)
                                    .replace('{{{fullStoryScript}}}', fullStoryScript);

app.use(logMiddleware({ name: 'BufferPublish' }));
app.use(cookieParser());

// All routes after this have access to the user session
app.use(setRequestSession({
  production: isProduction,
  sessionKeys: ['publish', 'global'],
}));

app.post('/rpc', (req, res, next) => {
  rpc(req, res)
    // catch any unexpected errors
    .catch((err) => {
      if (err.statusCode !== 500) {
        next({
          httpCode: err.statusCode,
          error: err.message,
        });
      } else {
        next(err);
      }
    });
});

// make sure we have a valid session
app.use(validateSession({
  production: isProduction,
  requiredSessionKeys: ['publish.accessToken', 'global.userId'],
}));

app.get('/health-check', controller.healthCheck);

// Pusher Auth
app.post('/pusher/auth',
  bodyParser.json(),
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;
    const auth = pusher.authenticate(socketId, channel);
    res.send(auth);
  },
);

app.get('*', (req, res) => res.send(getHtml()));

app.use(apiError);

server.listen(80, () => console.log('listening on port 80')); // eslint-disable-line

shutdownHelper.init({ server });
