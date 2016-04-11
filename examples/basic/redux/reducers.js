export default {
  test: (state = {}, action) => {
    console.log('test: reducer:: received action', action);
    return state;
  }
};
