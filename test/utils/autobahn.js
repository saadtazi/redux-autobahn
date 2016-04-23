import autobahn from 'autobahn';


export const getSession = () => {
  const connection = new autobahn.Connection({
    url: 'ws://127.0.0.1:9000/ws',
    realm: 'realm1'
  });
  const prom = new Promise((resolve) => {
    connection.onopen = (session) => {
      /* eslint no-param-reassign: 0 */
      session.connection = connection;
      resolve(session);
    };
  });

  connection.open();

  return prom;
};
