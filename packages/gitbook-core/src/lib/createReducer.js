
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
        const newValue = reduce(value, action);

        if (newValue === value) {
            return state;
        }

        const newState = {
            ...state,
            [name]: newValue
        };

        return newState;
    };
}

module.exports = createReducer;
