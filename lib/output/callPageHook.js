var Api = require('../api');
var callHook = require('./callHook');

var Promise = require('../utils/promise');

/**
    Call a hook for a specific page

    @param {String} name
    @param {Output} output
    @param {Page} page
    @return {Promise<Page>}
*/
function callPageHook(name, output, page) {
    return Promise(page);

    /*return callHook(
        name,

        function(out) {
            return Api.encodePage(out, page);
        },

        function(out, result) {
            return Api.decodePage(out, page, result);
        },

        output
    );*/
}

module.exports = callPageHook;
