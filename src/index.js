// options: {
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
//     createEvent: a function that transform the action before sending the event
//         it receive this action as input and should return [topic, args, kwargs, options]
//   }]
// }
const createDefaultAction = (args, kwargs, details) => ({
  type: details.topic,
  payload: {
    args,
    kwargs
  }
});

const createDefaultEvent = ({ type, ...kwargs }) => ([
  type, [], kwargs
]);

const makeArray = (input) => {
  if (!input) {
    return [];
  }
  if (!Array.isArray(input)) {
    return [input];
  }
  return input;
};

export default function createMiddleware(session, { subscribe, publish }) {
  const subscribeRules = makeArray(subscribe);
  const publishRules = makeArray(publish);

  return ({ dispatch }) => {
    // subscribe
    if (subscribe) {
      subscribeRules.forEach((sub) => {
        // we are asked to subscribe to `subscribe.uri`
        session.subscribe(sub.uri, (args, kwargs, details) => {
          const createAction = sub.createAction || createDefaultAction;
          const action = createAction(args, kwargs, details);
          // // put the action to the top of the middleware chain
          return dispatch(action);
        }, sub.options);
      });
    }
    return next => action => {
      // publish
      const publishRule = publishRules.find((rule) => {
        return action.type === rule.type;
      });

      if (publishRule) {
        const transformAction = publishRule.createEvent || createDefaultEvent;
        session.publish.apply(session, transformAction(action));
      }
      // let it go so other middleware can catch it...
      return next(action);
    };
  };
}
