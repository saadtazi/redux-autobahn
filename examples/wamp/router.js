
import Router from 'wamp.rt';

const onRPCRegistered = (uri) => {
  console.log('onRPCRegistered RPC registered', uri);
};

const onRPCUnregistered = (uri) => {
  console.log('onRPCUnregistered RPC unregistered', uri);
};

const onPublish = (topicUri, args) => {
  console.log('onPublish Publish', topicUri, args);
};

//
// WebSocket server
//
const app = new Router(
  { port: process.env.PORT || 9000,
    handleProtocols: (protocols, cb) => {
      console.log(protocols);
      cb(true, protocols[0]);
    }
  }
);

app.on('RPCRegistered', onRPCRegistered);
app.on('RPCUnregistered', onRPCUnregistered);
app.on('Publish', onPublish);
