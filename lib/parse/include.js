var _ = require('lodash');

module.exports = function(markdown, includer) {
    // Memoized include function (to cache lookups)
    var _include = _.memoize(includer);

    return markdown.replace(/{{([\s\S]+?)}}/g, function(match, key) {
        // If fails leave content as is
        key = key.trim();
        return _include(key) || match;
    });
};
