const Plugin = require('../models/Plugin');

/**
 * Create a plugin to extend the state and the views.
 *
 * @param  {Function(dispatch, state)} plugin.init
 * @param  {Function(state, action)} plugin.reduce
 * @param  {Object} plugin.actions
 * @return {Plugin}
 */
function createPlugin({ init, reduce, actions }) {
    const plugin = Plugin({
        init,
        reduce,
        actions
    });

    if (typeof window !== 'undefined') {
        window.gitbookPlugins = window.gitbookPlugins || [];
        window.gitbookPlugins.push(plugin);
    }

    return plugin;
}

module.exports = createPlugin;
