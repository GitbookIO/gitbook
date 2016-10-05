const Immutable = require('immutable');
const PluginDependency = require('../models/pluginDependency');

const pkg = require('../../package.json');

/**
 * Create a PluginDependency from a dependency of gitbook
 * @param {String} pluginName
 * @return {PluginDependency}
 */
function createFromDependency(pluginName) {
    const npmID = PluginDependency.nameToNpmID(pluginName);
    const version = pkg.dependencies[npmID];

    return PluginDependency.create(pluginName, version);
}

/*
 * List of default plugins for all books,
 * default plugins should be installed in node dependencies of GitBook
 */
module.exports = Immutable.List([
    'highlight',
    'search',
    'lunr',
    'sharing',
    'hints',
    'headings',
    'theme-default'
]).map(createFromDependency);
