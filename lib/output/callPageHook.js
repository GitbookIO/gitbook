var callHook = require('./callHook');

/**
    Call a hook for a specific page

    @param {String} name
    @param {Output} output
    @param {Page} page
    @return {Page}
*/
function callPageHook(name, output, page) {
    return callHook(
        name,

        function(out) {


        },

        function(result) {


        },

        output
    );
}

module.exports = callPageHook;
