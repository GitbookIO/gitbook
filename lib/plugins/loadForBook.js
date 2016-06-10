var Promise = require('../utils/promise');

var listForBook = require('./listForBook');
var findForBook = require('./findForBook');
var loadPlugin = require('./loadPlugin');


/**
 * Load all plugins in a book
 *
 * @param {Book}
 * @return {Promise<Map<String:Plugin>}
 */
function loadForBook(book) {
    var logger = book.getLogger();
    var requirements = listForBook(book);
    var requirementsKeys = requirements.keySeq().toList();

    return findForBook(book)
    .then(function(installed) {
        // Filter out plugins not listed of first level
        // (aka pre-installed plugins)
        /*installed = installed.filter(function(plugin) {
            return (
                // Plugin is a dependency of another one
                plugin.getDepth() > 0 ||

                // Plugin is specified in "book.json"
                requirements.has(plugin.getName())
            );
        });*/

        // Insert installed plugins not listed in required
        var pluginsToLoad = installed.reduce(function(pluginSeq, plugin) {
            var name = plugin.getName();

            if (requirements.has(name)) {
                return pluginSeq;
            }

            var parentName = plugin.getParent();


            pluginSeq = pluginSeq.push([
                name,
                plugin
            ]);

            return pluginSeq;
        }, requirements.entrySeq());



        // Log state
        logger.info.ln(installed.size + ' plugins are installed');
        if (requirements.size != installed.size) {
            logger.info.ln(requirements.size + ' explicitly listed');
        }

        // Verify that all plugins are present
        var notInstalled = requirementsKeys.filter(function(name) {
            return !installed.has(name);
        });

        if (notInstalled.size > 0) {
            throw new Error('Couldn\'t locate plugins "' + notInstalled.join(', ') + '", Run \'gitbook install\' to install plugins from registry.');
        }

        return Promise.map(installed, function(plugin) {
            return loadPlugin(book, plugin);
        });
    });
}


module.exports = loadForBook;
