const Api = require('../api');
const callHook = require('./callHook');

/**
 * Call a hook for a specific page.
 *
 * @param {String} name
 * @param {Output} output
 * @param {Page} page
 * @return {Promise<Page>}
 */
function callPageHook(name, output, page) {
    return callHook(
        name,

        (out) => {
            return Api.encodePage(out, page);
        },

        (out, result) => {
            return Api.decodePage(out, page, result);
        },

        output
    );
}

module.exports = callPageHook;
