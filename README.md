A redux middleware for [WAMP protocol](http://wamp-proto.org/) using [autobahn](http://autobahn.ws/js/).

## About

Pub/Sub only.

It allows to:
* generate actions whenever an autobahn event is received
* publish autobahn events when some actions are dispatched

**Note** this package requires `Array.prototype.find` (available in node 4+ and modern browsers). If this is a problem, there is a polyfill, available using:
```
require('redux-autobahn/src/find_polyfill');
// or
// import nothing from 'redux-autobahn/src/find_polyfill';
```

## Usage

```
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
    // {
    //   subscribe = [{
    //     uri: a string that represent the topic you want to subscribe to.
    //          It can be a prefix or wildcard (using `match` options).
    //          @see http://autobahn.ws/js/reference.html#subscribe
    //     options: an optional object with `match` property.
    //              @see http://autobahn.ws/js/reference.html#subscribe)
    //     createAction (optional): a function that will receive `args`, `kwargs`, `details`
    //                     and that should return an action
    //   }, {...}],
    //   publish: [{
    //     actionType: 'actionName',
    //     createEvent (optional): a function that transform the action before sending the event
    //         it receive this action as input and should return [topic, args, kwargs, options]
    //   }]
    // }
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
};
connection.open();
```
