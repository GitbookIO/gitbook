var fs = require('fs');
var path = require('path');

module.exports = function(code, folder) {
    folder = folder || '';

    return code.replace(/{{([\s\S]+?)}}/g, function(match, filename) {
        // Normalize filename
        var fname = path.join(folder, filename.trim());

        // Try including snippet from FS
        try {
            // Trim trailing newlines/space of imported snippets
            return fs.readFileSync(fname, 'utf8').trimRight();
        } catch(err) {}

        // If fails leave content as is
        return match;
    });
};
