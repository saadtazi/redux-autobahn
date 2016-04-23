(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.index = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = createMiddleware;

  function _objectWithoutProperties(obj, keys) {
    var target = {};

    for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue;
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
      target[i] = obj[i];
    }

    return target;
  }

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
  var createDefaultAction = function createDefaultAction(args, kwargs, details) {
    return {
      type: details.topic,
      payload: {
        args: args,
        kwargs: kwargs
      }
    };
  };

  var createDefaultEvent = function createDefaultEvent(_ref) {
    var type = _ref.type;

    var kwargs = _objectWithoutProperties(_ref, ["type"]);

    return [type, [], kwargs];
  };

  var makeArray = function makeArray(input) {
    if (!input) {
      return [];
    }
    if (!Array.isArray(input)) {
      return [input];
    }
    return input;
  };

  function createMiddleware(session, _ref2) {
    var subscribe = _ref2.subscribe;
    var publish = _ref2.publish;

    var subscribeRules = makeArray(subscribe);
    var publishRules = makeArray(publish);

    return function (_ref3) {
      var dispatch = _ref3.dispatch;

      // subscribe
      if (subscribe) {
        subscribeRules.forEach(function (sub) {
          // we are asked to subscribe to `subscribe.uri`
          session.subscribe(sub.uri, function (args, kwargs, details) {
            var createAction = sub.createAction || createDefaultAction;
            var action = createAction(args, kwargs, details);
            // // put the action to the top of the middleware chain
            return dispatch(action);
          }, sub.options);
        });
      }
      return function (next) {
        return function (action) {
          // publish
          var publishRule = publishRules.find(function (rule) {
            return action.type === rule.type;
          });

          if (publishRule) {
            var transformAction = publishRule.createEvent || createDefaultEvent;
            session.publish.apply(session, transformAction(action));
          }
          // let it go so other middleware can catch it...
          return next(action);
        };
      };
    };
  }
});