const Immutable = require('immutable');

const Promise = require('../utils/promise');
const listDepsForBook = require('./listDepsForBook');
const findForBook = require('./findForBook');
const loadPlugin = require('./loadPlugin');


/**
 * Load all plugins in a book
 *
 * @param {Book}
 * @return {Promise<Map<String:Plugin>}
 */
function loadForBook(book) {
    const logger = book.getLogger();

    // List the dependencies
    const requirements = listDepsForBook(book);

    // List all plugins installed in the book
    return findForBook(book)
    .then((installedMap) => {
        const missing = [];
        let plugins = requirements.reduce((result, dep) => {
            const name = dep.getName();
            const installed = installedMap.get(name);

            if (installed) {
                const deps = installedMap
                    .filter((plugin) => {
                        return plugin.getParent() === name;
                    })
                    .toArray();

                result = result.concat(deps);
                result.push(installed);
            } else {
                missing.push(name);
            }

            return result;
        }, []);

        // Convert plugins list to a map
        plugins = Immutable.List(plugins)
            .map((plugin) => {
                return [
                    plugin.getName(),
                    plugin
                ];
            });
        plugins = Immutable.OrderedMap(plugins);

        // Log state
        logger.info.ln(installedMap.size + ' plugins are installed');
        if (requirements.size != installedMap.size) {
            logger.info.ln(requirements.size + ' explicitly listed');
        }

        // Verify that all plugins are present
        if (missing.length > 0) {
            throw new Error('Couldn\'t locate plugins "' + missing.join(', ') + '", Run \'gitbook install\' to install plugins from registry.');
        }

        return Promise.map(plugins, (plugin) => {
            return loadPlugin(book, plugin);
        });
    });
}


module.exports = loadForBook;
