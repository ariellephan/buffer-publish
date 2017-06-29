const { method } = require('@bufferapp/micro-rpc');
const RPCClient = require('micro-rpc-client');
const rp = require('request-promise');

const rpcClient = new RPCClient({
  serverUrl: 'http://session-service',
});

module.exports = method(
  'login',
  'login using email and password',
  // TODO: schema validation https://github.com/hapijs/joi
  // TODO: find a way to not use clientId and clientSecret
  ({
    email,
    password,
    clientId,
    clientSecret,
  }) => rp({
    uri: `${process.env.API_ADDR}/1/user/signin.json`,
    method: 'POST',
    strictSSL: false,
    form: {
      client_id: clientId,
      client_secret: clientSecret,
      email,
      password,
    },
    json: true,
  })
    .then(res => rpcClient.call('create', {
      session: {
        accessToken: res.token,
      },
    }))
    .then(({ token }) => ({ token })));