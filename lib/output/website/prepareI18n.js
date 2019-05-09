var path = require('path');

var fs = require('../../utils/fs');
var Promise = require('../../utils/promise');
var listSearchPaths = require('./listSearchPaths');

/**
 * Prepare i18n, load translations from plugins and book
 *
 * @param {Output}
 * @return {Promise<Output>}
 */
function prepareI18n(output) {
    var state = output.getState();
    var i18n = state.getI18n();
    var searchPaths = listSearchPaths(output);

    searchPaths
        .reverse()
        .forEach(function(searchPath) {
            var i18nRoot = path.resolve(searchPath, '_i18n');

            if (!fs.existsSync(i18nRoot)) return;
            i18n.load(i18nRoot);
        });

    return Promise(output);
}

module.exports = prepareI18n;
