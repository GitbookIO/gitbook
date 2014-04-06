define([
    "jQuery",
    "lodash",
    "lunr",
], function($, _, lunr) {
    var index = null;

    // Load complete index
    var loadIndex = function() {
        return $.getJSON("search_index.json")
        .then(function(data) {
            index = lunr.Index.load(data);
        });
    };

    // Search for a term
    var search = function(q) {
        if (!index) return;
        var results = _.chain(index.search(q))
        .map(function(result) {
            var parts = result.ref.split("#")
            return {
                path: parts[0],
                hash: parts[1]
            }
        })
        .value();

        return results;
    };


    var init = function() {
        loadIndex();
    };

    return {
        init: init,
        search: search
    };
});