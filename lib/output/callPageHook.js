var Api = require('../api');
var callHook = require('./callHook');

/**
    Call a hook for a specific page

    @param {String} name
    @param {Output} output
    @param {Page} page
    @return {Promise<Page>}
*/
function callPageHook(name, output, page) {
    return callHook(
        name,

        function(out) {
            return Api.encodePage(output, page);
        },

        function(result) {
            return Api.decodePage(output, page, result);
        },

        output
    );
}

module.exports = callPageHook;
