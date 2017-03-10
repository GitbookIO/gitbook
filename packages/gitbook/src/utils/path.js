const Path = require('path');
const error = require('./error');

/**
 * Normalize a filename
 */
function normalizePath(filename) {
    return Path.normalize(filename);
}

/**
 * Return true if file path is inside a folder
 */
function isInRoot(root, filename) {
    root = Path.normalize(root);
    filename = Path.normalize(filename);

    if (root === '.') {
        return true;
    }
    if (root[root.length - 1] != Path.sep) {
        root = root + Path.sep;
    }

    return (filename.substr(0, root.length) === root);
}

/**
 * Resolve paths in a specific folder
 * Throw error if file is outside this folder
 */
function resolveInRoot(root, ...args) {
    const input = args
        .reduce((current, p) => {
            // Handle path relative to book root ("/README.md")
            if (p[0] == '/' || p[0] == '\\') return p.slice(1);

            return current ? Path.join(current, p) : Path.normalize(p);
        }, '');

    const result = Path.resolve(root, input);

    if (!isInRoot(root, result)) {
        throw new error.FileOutOfScopeError({
            filename: result,
            root
        });
    }

    return result;
}

/**
 * Change extension of a file
 */
function setExtension(filename, ext) {
    return Path.join(
        Path.dirname(filename),
        Path.basename(filename, Path.extname(filename)) + ext
    );
}

/**
 * Return true if a filename is relative.
 *
 * @param {String}
 * @return {Boolean}
 */
function isPureRelative(filename) {
    return (filename.indexOf('./') === 0 || filename.indexOf('../') === 0);
}

/**
 * Implementation based on https://github.com/domenic/path-is-inside/
 *
 * @param {String} path
 * @param {String} potentialParent
 * @return {Boolean} True if path match the parent path, or if path is inside parent path
 */
function isInside(path = '', potentialParent) {
    // For inside-directory checking, we want to allow trailing slashes, so normalize.
    path = stripTrailingSep(path);
    potentialParent = stripTrailingSep(potentialParent);

    return path.lastIndexOf(potentialParent, 0) === 0 &&
        (
            path[potentialParent.length] === Path.sep ||
            path[potentialParent.length] === undefined
        );
}

function stripTrailingSep(path) {
    if (path[path.length - 1] === Path.sep) {
        return path.slice(0, -1);
    }
    return path;
}

module.exports = {
    isInRoot,
    isInside,
    resolveInRoot,
    normalize: normalizePath,
    setExtension,
    stripTrailingSep,
    isPureRelative
};
