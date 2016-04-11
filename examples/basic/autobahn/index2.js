import autobahn from 'autobahn';

const connection = new autobahn.Connection({
  url: 'ws://127.0.0.1:9000/ws',
  realm: 'realm1'
});

connection.onopen = (session) => {
  // 1) subscribe to a topic
  function onevent(args, kwargs) {
    console.log('Event:', args[0], kwargs);
  }
  session.subscribe('com.myapp.hello', onevent);
};

connection.open();
