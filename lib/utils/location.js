var url = require('url');
var path = require('path');

// Is the url an external url
function isExternal(href) {
    try {
        return Boolean(url.parse(href).protocol) && !isDataURI(href);
    } catch(err) {
        return false;
    }
}

// Is the url an iniline data-uri
function isDataURI(href) {
    try {
        return Boolean(url.parse(href).protocol) && (url.parse(href).protocol === 'data:');
    } catch(err) {
        return false;
    }
}

// Inverse of isExternal
function isRelative(href) {
    return !isExternal(href);
}

// Return true if the link is an achor
function isAnchor(href) {
    try {
        var parsed = url.parse(href);
        return !!(!parsed.protocol && !parsed.path && parsed.hash);
    } catch(err) {
        return false;
    }
}

// Normalize a path to be a link
function normalize(s) {
    return path.normalize(s).replace(/\\/g, '/');
}

/**
 * Flatten a path, it removes the leading "/"
 *
 * @param {String} href
 * @return {String}
 */
function flatten(href) {
    href = normalize(href);
    if (href[0] == '/') {
        href = normalize(href.slice(1));
    }

    return href;
}

/**
 * Convert a relative path to absolute
 *
 * @param {String} href
 * @param {String} dir: directory parent of the file currently in rendering process
 * @param {String} outdir: directory parent from the html output
 * @return {String}
 */
function toAbsolute(_href, dir, outdir) {
    if (isExternal(_href) || isDataURI(_href)) {
        return _href;
    }

    outdir = outdir == undefined? dir : outdir;

    _href = normalize(_href);
    dir = normalize(dir);
    outdir = normalize(outdir);

    // Path "_href" inside the base folder
    var hrefInRoot = normalize(path.join(dir, _href));
    if (_href[0] == '/') {
        hrefInRoot = normalize(_href.slice(1));
    }

    // Make it relative to output
    _href = path.relative(outdir, hrefInRoot);

    // Normalize windows paths
    _href = normalize(_href);

    return _href;
}

/**
 * Convert an absolute path to a relative path for a specific folder (dir)
 * ('test/', 'hello.md') -> '../hello.md'
 *
 * @param {String} dir: current directory
 * @param {String} file: absolute path of file
 * @return {String}
 */
function relative(dir, file) {
    var isDirectory = file.slice(-1) === '/';
    return normalize(path.relative(dir, file)) + (isDirectory? '/': '');
}

/**
 * Convert an absolute path to a relative path for a specific folder (dir)
 * ('test/test.md', 'hello.md') -> '../hello.md'
 *
 * @param {String} baseFile: current file
 * @param {String} file: absolute path of file
 * @return {String}
 */
function relativeForFile(baseFile, file) {
    return relative(path.dirname(baseFile), file);
}

/**
 * Compare two paths, return true if they are identical
 * ('README.md', './README.md') -> true
 *
 * @param {String} p1: first path
 * @param {String} p2: second path
 * @return {Boolean}
 */
function areIdenticalPaths(p1, p2) {
    return normalize(p1) === normalize(p2);
}

module.exports = {
    areIdenticalPaths: areIdenticalPaths,
    isDataURI:         isDataURI,
    isExternal:        isExternal,
    isRelative:        isRelative,
    isAnchor:          isAnchor,
    normalize:         normalize,
    toAbsolute:        toAbsolute,
    relative:          relative,
    relativeForFile:   relativeForFile,
    flatten:           flatten
};
