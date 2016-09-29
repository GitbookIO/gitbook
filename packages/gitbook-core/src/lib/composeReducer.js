
/**
 * Compose multiple reducers into one
 * @param  {Function} reducers
 * @return {Function}
 */
function composeReducer(...reducers) {
    return (state, action) => {
        return reducers.reduce(
            (newState, reducer) => reducer(newState, action),
            state
        );
    };
}

module.exports = composeReducer;
