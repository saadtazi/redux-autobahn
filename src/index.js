// options: {
//   subscribe = {
//     uri: a string that represent the topic you want to subscribe to.
//          It can be a prefix or wildcard (using `match` options).
//          @see http://autobahn.ws/js/reference.html#subscribe
//     options: an optional object with `match` property.
//              @see http://autobahn.ws/js/reference.html#subscribe)
//     createAction: a function that will receive `args`, `kwargs`, `details`
//                     and that should return an action
// }

const createDefaultAction = (args, kwargs, details) => ({
  type: details.topic,
  payload: {
    args,
    kwargs
  }
});

export default function createMiddleware(session, { subscribe }) {
  return ({ dispatch }) => {
    if (subscribe && subscribe.uri) {
      // we are asked to subscribe to `subscribe.uri`
      session.subscribe(subscribe.uri, (args, kwargs, details) => {
        const createAction = subscribe.createAction || createDefaultAction;
        const action = createAction(args, kwargs, details);
        // // put the action to the top of the middleware chain
        return dispatch(action);
      }, subscribe.options);
    }
    return next => action => next(action);
  };
}
