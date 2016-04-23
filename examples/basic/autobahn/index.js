import autobahn from 'autobahn';

const connection = new autobahn.Connection({
  url: 'ws://127.0.0.1:9000/ws',
  realm: 'realm1'
});

connection.onopen = (session) => {
  // 1) subscribe to a topic
  function onevent(args, kwargs, options) {
    console.log('Event:', args, kwargs, options);
  }
  session.subscribe('com.myapp.hello', onevent);
  session.subscribe('com.myapp.listen', onevent);
  session.subscribe('com.myapp.listen2', onevent);

  // 2) publish an event
  console.log('publishing com.myapp.hello');
  session.publish('com.myapp.hello', ['Hello, world!'], { type: 'miaw' });
  session.publish('com.myapp.saad.hello', ['Hello, world!'], { type: 'saad' });
  session.publish('com.myapp.saad.hello2', ['Hello2222, world!'], { type: 'saad' });
};

connection.open();
