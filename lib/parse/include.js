var _ = require('lodash');
var fs = require('graceful-fs');
var path = require('path');


// Include helper
function importInclude(name, paths) {
    return paths
    .map(function(folder) {
        // Try including snippet from FS
        try {
            var fname = path.join(folder, name);
            // Trim trailing newlines/space of imported snippets
            return fs.readFileSync(fname, 'utf8').trimRight();
        } catch(err) {}
    })
    .filter(Boolean)[0];
}

function includer(ctx, folders) {
    return function(key) {
        key = key.trim();
        return ctx[key] || importInclude(key, folders);
    };
}

module.exports = function(markdown, folder, ctx) {
    // List of folders to search for includes
    var folders = [];

    // Handle folder arg (string or array)
    if(_.isString(folder)) {
        folders = [folder];
    } else if(_.isArray(folder)) {
        folders = folder;
    }

    // variable context
    ctx = ctx || {};

    // Memoized include function (to cache lookups)
    var _include = _.memoize(includer(ctx, folders));

    return markdown.replace(/{{([\s\S]+?)}}/g, function(match, key) {
        // If fails leave content as is
        return _include(key) || match;
    });
};
