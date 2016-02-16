var npm = require('npm');

var PLUGIN_PREFIX = 'gitbook-plugin-';

// Return an absolute name for the plugin (the one on NPM)
function npmId(name) {
    if (name.indexOf(PLUGIN_PREFIX) === 0) return name;
    return [PLUGIN_PREFIX, name].join('');
}

// Return a plugin ID 9the one on GitBook
function pluginId(name) {
    return name.replace(PLUGIN_PREFIX, '');
}

// Validate an NPM plugin ID
function validateId(name) {
    return name.indexOf(PLUGIN_PREFIX) === 0;
}

// Link a plugin for use in a specific book
function linkPlugin(book, pluginPath) {
    book.log('linking', pluginPath);
}

// Install a plugin in a book
function installPlugin(book, pluginId) {
    book.log('installing plugin', pluginId);
}

module.exports = {
    npmId: npmId,
    pluginId: pluginId,
    validateId: validateId,

    link: linkPlugin,
    install: installPlugin
};
