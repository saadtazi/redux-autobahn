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
  // options: {
  //   subscribe = {
  //     uri: a string that represent the topic you want to subscribe to.
  //          It can be a prefix or wildcard (using `match` options).
  //          @see http://autobahn.ws/js/reference.html#subscribe
  //     options: an optional object with `match` property.
  //              @see http://autobahn.ws/js/reference.html#subscribe)
  //     generateAction: a function that will receive `args`, `kwargs`, `details`
  //                     and that should return an action
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

  function createMiddleware(session, _ref) {
    var subscribe = _ref.subscribe;

    return function (_ref2) {
      var dispatch = _ref2.dispatch;

      if (subscribe && subscribe.uri) {
        // we are asked to subscribe to `subscribe.uri`
        session.subscribe(subscribe.uri, function (args, kwargs, details) {
          var createAction = subscribe.createAction || createDefaultAction;
          var action = createAction(args, kwargs, details);
          // // put the action to the top of the middleware chain
          return dispatch(action);
        }, subscribe.options);
      }
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
  }
});