import { createStore, combineReducers, applyMiddleware } from 'redux';

import createAutobahnMiddleware from '../../src';

const defaultReducer = (state = {}) => state;

export const getStore = (autobahnSession, opts, reducers) => {
  const autobahnMiddleware = createAutobahnMiddleware(autobahnSession, opts);
  // your app reducers
  let testApp = combineReducers(reducers || { someKey: defaultReducer });
  return createStore(
    testApp,
    applyMiddleware(autobahnMiddleware)
  );
};
