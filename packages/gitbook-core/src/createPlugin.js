
/**
 * Create a plugin to extend the state and the views.
 *
 * @param  {Function(dispatch, state)} onInitialState
 * @param  {Funciton(state, action)} onReduceState
 * @return {Plugin}
 */
function createPlugin(onInitialState, onReduceState) {
    const plugin = {
        onInitialState,
        onReduceState
    };

    if (typeof window !== 'undefined') {
        window.gitbookPlugins = window.gitbookPlugins || [];
        window.gitbookPlugins.push(plugin);
    }

    return plugin;
}

module.exports = createPlugin;
