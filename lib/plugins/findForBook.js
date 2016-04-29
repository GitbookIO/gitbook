var path = require('path');
var Immutable = require('immutable');

var Promise = require('../utils/promise');
var findInstalled = require('./findInstalled');

/**
    List all plugins installed in a book

    @param {Book}
    @return {Promise<OrderedMap<String:Plugin>>}
*/
function findForBook(book) {
    return Promise.all([
        findInstalled(path.resolve(__dirname, '../..')),
        findInstalled(book.getRoot())
    ])

    // Merge all plugins
    .then(function(results) {
        return Immutable.List(results)
            .reduce(function(out, result) {
                return out.merge(result);
            }, Immutable.OrderedMap());
    });
}


module.exports = findForBook;
