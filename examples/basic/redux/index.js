import { createStore, combineReducers, applyMiddleware } from 'redux';

import reducers from './reducers';

// The magic happens below
import autobahn from 'autobahn';
// 1. import this lib
import createAutobahnMiddleware from '../../../src';
// 2. create a connection
const connection = new autobahn.Connection({
  url: 'ws://127.0.0.1:9000/ws',
  realm: 'realm1'
});

connection.onopen = (session) => {
  // 3. create the middleware
  const autobahnMiddleware = createAutobahnMiddleware(session, {
    // this works with crossbar.io, not with `wamp.rt` (subscribe option not supported)
    // subscribe: { uri: 'com.myapp..hello', options: { match: 'wildcard' } }
    subscribe: [
      { uri: 'com.myapp.saad.hello' },
      {
        uri: 'com.myapp.saad.hello2',
        createAction: (args, kwargs) => ({
          type: 'hello2', payload: kwargs
        })
      }
    ],
    publish: [
      { type: 'com.myapp.listen' },
      { type: 'SomeRealAction', createEvent: (action) =>
        ['com.myapp.listen2', [], action.payload]
      }
    ]
  });
  // your app reducers
  let testApp = combineReducers(reducers);
  const store = createStore(
    testApp,
    // 4. use the middleware
    applyMiddleware(autobahnMiddleware)
  );
  store.dispatch({ type: 'go go go!' });
  //
  setInterval(() => {
    // store.dispatch({
    //   type: 'com.myapp.listen', payload: { some: 'payload' }
    // });
    store.dispatch({
      type: 'SomeRealAction', payload: { some: 'payload2' }
    });
  }, 10000);
};
connection.open();
