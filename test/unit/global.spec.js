require('../../src/find_polyfill');
import { getRouter } from '../utils/wamp';

let router;

before(function () {
  router = getRouter();
});

after(function () {
  router.close();
});
