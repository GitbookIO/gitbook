var path = require('path');
var error = require('./error');

// Normalize a filename
function normalizePath(filename) {
    return path.normalize(filename);
}

// Return true if file path is inside a folder
function isInRoot(root, filename) {
    root = path.normalize(root);
    filename = path.normalize(filename);

    if (root === '.') {
        return true;
    }
    if (root[root.length - 1] != path.sep) {
        root = root + path.sep;
    }

    return (filename.substr(0, root.length) === root);
}

// Resolve paths in a specific folder
// Throw error if file is outside this folder
function resolveInRoot(root) {
    var input, result;
    var args = Array.prototype.slice.call(arguments, 1);

    input = args
        .reduce(function(current, p) {
            // Handle path relative to book root ("/README.md")
            if (p[0] == '/' || p[0] == '\\') return p.slice(1);

            return current? path.join(current, p) : path.normalize(p);
        }, '');

    result = path.resolve(root, input);

    if (!isInRoot(root, result)) {
        throw new error.FileOutOfScopeError({
            filename: result,
            root: root
        });
    }

    return result;
}

// Chnage extension of a file
function setExtension(filename, ext) {
    return path.join(
        path.dirname(filename),
        path.basename(filename, path.extname(filename)) + ext
    );
}

/*
    Return true if a filename is relative.

    @param {String}
    @return {Boolean}
*/
function isPureRelative(filename) {
    return (filename.indexOf('./') === 0 || filename.indexOf('../') === 0);
}

module.exports = {
    isInRoot: isInRoot,
    resolveInRoot: resolveInRoot,
    normalize: normalizePath,
    setExtension: setExtension,
    isPureRelative: isPureRelative
};
