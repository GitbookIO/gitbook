var Immutable = require('immutable');

var Promise = require('../utils/promise');
var timing = require('../utils/timing');
var findInstalled = require('./findInstalled');
var locateRootFolder = require('./locateRootFolder');

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
            return Immutable.List(results)
                .reduce(function(out, result) {
                    return out.merge(result);
                }, Immutable.OrderedMap());
        })
    );
}


module.exports = findForBook;
