var url = require('url');
var path = require('path');

// Is the link an external link
var isExternal = function(href) {
    try {
        return Boolean(url.parse(href).protocol);
    } catch(err) { }

    return false;
};

// Return true if the link is relative
var isRelative = function(href) {
    try {
        var parsed = url.parse(href);

        return !parsed.protocol && parsed.path && parsed.path[0] != '/';
    } catch(err) {}

    return true;
};

// Relative to absolute path
// dir: directory parent of the file currently in rendering process
// outdir: directory parent from the html output

var toAbsolute = function(_href, dir, outdir) {
    // Absolute file in source
    _href = path.join(dir, _href);

    // make it relative to output
    _href = path.relative(outdir, _href);

    if (process.platform === 'win32') {
        _href = _href.replace(/\\/g, '/');
    }

    return _href;
};

// Join links

var join = function() {
    var _href = path.join.apply(path, arguments);

    if (process.platform === 'win32') {
        _href = _href.replace(/\\/g, '/');
    }

    return _href;
};


module.exports = {
    isRelative: isRelative,
    isExternal: isExternal,
    toAbsolute: toAbsolute,
    join: join
};
