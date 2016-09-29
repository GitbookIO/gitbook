
const defaultInit = ((dispatch, getState) => {});
const defaultReduce = ((state, action) => state);

/**
 * Create a plugin to extend the state and the views.
 *
 * @param  {Function(dispatch, state)} onInitialState
 * @param  {Funciton(state, action)} onReduceState
 * @return {Plugin}
 */
function createPlugin({ init, reduce, actions }) {
    init = init || defaultInit;
    reduce = reduce || defaultReduce;
    actions = actions || {};

    const plugin = {
        init,
        reduce,
        actions
    };

    if (typeof window !== 'undefined') {
        window.gitbookPlugins = window.gitbookPlugins || [];
        window.gitbookPlugins.push(plugin);
    }

    return plugin;
}

module.exports = createPlugin;
