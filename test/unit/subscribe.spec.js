import chai from 'chai';
import sinonChai from 'sinon-chai';
import { getStore } from '../utils/redux_store';
import { getSession } from '../utils/autobahn';

chai.should();
chai.use(sinonChai);

describe('`subscribe`', function () {
  let session;

  before(function () {
    return getSession()
      .then((sess) => {
        session = sess;
      });
  });
  after(function () {
    session.connection.close();
  });

  const testPublish = (action, expectedActionType, func, done) => {
    if (action.type === expectedActionType) {
      try {
        func();
      } catch (e) {
        return done(e);
      }
      return done();
    }
  };

  describe('when one basic `subscribe` option is provided (no `createAction` function)', function () {
    it('should dispatch an action when the event is received', function (done) {
      getStore(session, {
        subscribe: { uri: 'someEvent' }
      }, { test: (previousState = {}, action) => {
        testPublish(action, 'someEvent', () => {
          action.payload.args.should.eql(['args']);
          action.payload.kwargs.should.eql({ some: 'kwargs' });
        }, done);
        return action;
      } });

      session.publish('someEvent', ['args'], { some: 'kwargs' });
    });
  });

  describe('when one `subscribe` option is provided (with `createAction` function)', function () {
    it('should dispatch an action when the event is received', function (done) {
      getStore(session, {
        subscribe: {
          uri: 'someFullEvent',
          createAction: (args, kwargs, details) => ({
            type: `${details.topic}Mod`,
            payload: { b: kwargs.a + 18, args0: args[0] }
          })
        }
      }, { test: (previousState = {}, action) => {
        testPublish(action, 'someFullEventMod', () => {
          action.payload.should.eql({ b: 20, args0: 'args' });
        }, done);
        return action;
      } });

      session.publish('someFullEvent', ['args'], { a: 2 });
    });
  });

  describe('when multiple `subscribe` options are provided', function () {
    it('should dispatch an action when one of the event is received', function (done) {
      getStore(session, {
        subscribe: [{ uri: 'someEvent1' }, { uri: 'someEvent2' }]
      }, { test: (previousState = {}, action) => {
        testPublish(action, 'someEvent2', () => {
          action.payload.args.should.eql(['args2']);
          action.payload.kwargs.should.eql({ some: 'kwargs2' });
        }, done);
        return action;
      } });

      session.publish('someEvent2', ['args2'], { some: 'kwargs2' });
    });
  });
});
