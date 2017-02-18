const path = require('path');
const NativeModule = require('module');
const timing = require('../utils/timing');

// Still set NODE_PATH since tasks may need it.
// This is an hack so that require('gitbook-core') may work in all plugins.
// If it caused bugs, we can replaced by an installation (or live) operation to symlink "gitbook-core"
// into plugin's node_modules.
const globalPath = path.resolve(__dirname, 'exports');
process.env.NODE_PATH = (process.env.NODE_PATH ? `${process.env.NODE_PATH}:` : '') + globalPath;
NativeModule._initPaths();

/**
 * Load all browser plugins.
 *
 * @param  {OrderedMap<Plugin>} plugins
 * @param  {String} type ('browser', 'ebook')
 * @return {Array}
 */
function loadPlugins(plugins, type) {
    return timing.measure(
        'browser.loadPlugins',
        () => {
            return plugins
                .valueSeq()
                .filter(plugin => plugin.getPackage().has(type))
                .map((plugin) => {
                    const browserFile = path.resolve(
                        plugin.getPath(),
                        plugin.getPackage().get(type)
                    );

                    return require(browserFile);
                })
                .toArray();
        }
    );
}

module.exports = loadPlugins;
