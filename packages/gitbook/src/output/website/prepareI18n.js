const path = require('path');

const fs = require('../../utils/fs');
const Promise = require('../../utils/promise');
const listSearchPaths = require('./listSearchPaths');

/**
 * Prepare i18n, load translations from plugins and book
 *
 * @param {Output}
 * @return {Promise<Output>}
 */
function prepareI18n(output) {
    const state = output.getState();
    const i18n = state.getI18n();
    const searchPaths = listSearchPaths(output);

    searchPaths
        .reverse()
        .forEach(function(searchPath) {
            const i18nRoot = path.resolve(searchPath, '_i18n');

            if (!fs.existsSync(i18nRoot)) return;
            i18n.load(i18nRoot);
        });

    return Promise(output);
}

module.exports = prepareI18n;
