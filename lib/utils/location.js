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

module.exports = {
    isExternal: isExternal,
    isRelative: isRelative
};
