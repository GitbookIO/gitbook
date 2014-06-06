var url = require('url');
var path = require('path');

// Return true if the link is relative
var isRelative = function(href) {
    var parsed = url.parse(href);

    return !parsed.protocol && parsed.path && parsed.path[0] != '/';
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
    toAbsolute: toAbsolute,
    join: join
};