const { List, OrderedMap } = require('immutable');

const Promise = require('../utils/promise');
const timing = require('../utils/timing');
const findInstalled = require('./findInstalled');
const locateRootFolder = require('./locateRootFolder');

/**
 * List all plugins installed in a book
 *
 * @param {Book}
 * @return {Promise<OrderedMap<String:Plugin>>}
 */
function findForBook(book) {
    return timing.measure(
        'plugins.findForBook',

        Promise.all([
            findInstalled(locateRootFolder()),
            findInstalled(book.getRoot())
        ])

        // Merge all plugins
        .then(function(results) {
            return List(results)
                .reduce(function(out, result) {
                    return out.merge(result);
                }, OrderedMap());
        })
    );
}


module.exports = findForBook;
