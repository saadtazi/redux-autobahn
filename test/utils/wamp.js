import Router from 'wamp.rt';

export const getRouter = () => {
  const app = new Router(
    { port: 9000,
      path: '/ws',
      handleProtocols: (protocols, cb) => {
        cb(true, protocols[0]);
      }
    }
  );
  return app;
};
