var url = require('url');

// Is the url an external url
function isExternal(href) {
    try {
        return Boolean(url.parse(href).protocol);
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

module.exports = {
    isExternal: isExternal,
    isRelative: isRelative,
    isAnchor: isAnchor
};
