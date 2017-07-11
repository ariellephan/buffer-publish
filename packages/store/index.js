import {
  createStore,
  applyMiddleware,
  compose,
} from 'redux';
import { routerMiddleware } from 'react-router-redux';
import createHistory from 'history/createHashHistory';
import { middleware as loginMiddleware } from '@bufferapp/login';
import { middleware as exampleMiddleware } from '@bufferapp/example';
import { middleware as tabsMiddleware } from '@bufferapp/tabs';
import { middleware as queueMiddleware } from '@bufferapp/queue';
import { middleware as sentMiddleware } from '@bufferapp/sent';
import { middleware as i18nMiddleware } from '@bufferapp/publish-i18n';
import { middleware as asyncDataFetchMiddleware } from '@bufferapp/async-data-fetch';
import reducers from './reducers';

export const history = createHistory();

const configureStore = (initialstate) => {
  const composeEnhancers =
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

  return createStore(
    reducers,
    initialstate,
    composeEnhancers(
      applyMiddleware(loginMiddleware),
      applyMiddleware(i18nMiddleware),
      applyMiddleware(queueMiddleware),
      applyMiddleware(sentMiddleware),
      applyMiddleware(asyncDataFetchMiddleware),
      applyMiddleware(routerMiddleware(history)),
      applyMiddleware(tabsMiddleware),
      applyMiddleware(exampleMiddleware),
    ),
  );
};

export default configureStore;
