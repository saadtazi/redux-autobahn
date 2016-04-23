import chai from 'chai';
import sinonChai from 'sinon-chai';
import { getStore } from '../utils/redux_store';
import { getSession } from '../utils/autobahn';

chai.should();
chai.use(sinonChai);

describe('`publish`', function () {
  let session;
  let store;

  before(function () {
    return getSession()
      .then((sess) => {
        session = sess;
      });
  });
  after(function () {
    session.connection.close();
  });

  const testSubscribe = (func, done) => {
    try {
      func();
    } catch (e) {
      return done(e);
    }
    return done();
  };

  describe('when one basic `publish` option is provided (no `createEvent` function)', function () {
    beforeEach(() => {
      store = getStore(session, {
        publish: { type: 'someBasicAction' }
      });
    });
    it('should publish an event when the action is triggered', function (done) {
      session.subscribe('someBasicAction', (args, kwargs, details) => {
        testSubscribe(() => {
          args.should.eql([]);
          kwargs.should.eql({ payload: { a: 1 } });
          details.topic.should.eql('someBasicAction');
        }, done);
      });
      store.dispatch({ type: 'someBasicAction', payload: { a: 1 } });
    });
  });

  describe('when a `publish` option with a `createEvent` function is provided', function () {
    beforeEach(() => {
      store = getStore(session, {
        publish: {
          type: 'someFullAction',
          createEvent: (action) => [
            'modified.event.name',
            ['args'],
            { b: action.payload.a * 2 }
          ]
        }
      });
    });
    it('should publish an event when the action is triggered', function (done) {
      session.subscribe('modified.event.name', (args, kwargs, details) => {
        testSubscribe(() => {
          args.should.eql(['args']);
          kwargs.should.eql({ b: 2 });
          details.topic.should.eql('modified.event.name');
        }, done);
      });
      store.dispatch({ type: 'someFullAction', payload: { a: 1 } });
    });
  });

  describe('when `publish` is an array', function () {
    beforeEach(() => {
      store = getStore(session, {
        publish: [{ type: 'action1' }, { type: 'action2' }]
      });
    });

    it('should publish an event when the one of the actions are triggered', function (done) {
      session.subscribe('action2', (args, kwargs, details) => {
        testSubscribe(() => {
          args.should.eql([]);
          kwargs.should.eql({ payload: { a: 1 } });
          details.topic.should.eql('action2');
        }, done);
      });
      store.dispatch({ type: 'action2', payload: { a: 1 } });
    });
  });
});
