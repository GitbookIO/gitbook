
/**
 * Helper to create a reducer that extend the store.
 *
 * @param  {String} property
 * @param  {Function(state, action): state} reduce
 * @return {Function(state, action): state}
 */
function createReducer(name, reduce) {
    return (state, action) => {
        const value = state[name];
        state[name] = reduce(value, action);
        return state;
    };
}

module.exports = createReducer;
