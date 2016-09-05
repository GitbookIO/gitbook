
/**
 * Create a plugin to extend the state and the views.
 *
 * @param  {Function(dispatch, state)} onInitialState
 * @param  {Funciton(state, action)} onReduceState
 * @return {Plugin}
 */
function createPlugin(onInitialState, onReduceState) {
    return {
        onInitialState,
        onReduceState
    };
}

module.exports = createPlugin;
