var url = require('url');
var path = require('path');

// Is the link an external link
function isExternal(href) {
    try {
        return Boolean(url.parse(href).protocol);
    } catch(err) {
        return false;
    }
}

// Return true if the link is relative
function isRelative(href) {
    try {
        var parsed = url.parse(href);

        return !!(!parsed.protocol && parsed.path);
    } catch(err) {
        return true;
    }
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
function normalizeLink(s) {
    return s.replace(/\\/g, '/');
}

// Relative to absolute path
// dir: directory parent of the file currently in rendering process
// outdir: directory parent from the html output
function toAbsolute(_href, dir, outdir) {
    if (isExternal(_href)) return _href;

    // Path "_href" inside the base folder
    var hrefInRoot = path.normalize(path.join(dir, _href));
    if (_href[0] == '/') hrefInRoot = path.normalize(_href.slice(1));

    // Make it relative to output
    _href = path.relative(outdir, hrefInRoot);

    // Normalize windows paths
    _href = normalizeLink(_href);

    return _href;
}

// Join links
function join() {
    var _href = path.join.apply(path, arguments);

    return normalizeLink(_href);
};

// Change extension
function changeExtension(filename, newext) {
    return path.join(
        path.dirname(filename),
        path.basename(filename, path.extname(filename))+newext
    );
}

module.exports = {
    isAnchor: isAnchor,
    isRelative: isRelative,
    isExternal: isExternal,
    toAbsolute: toAbsolute,
    join: join,
    changeExtension: changeExtension,
    normalize: normalizeLink
};
