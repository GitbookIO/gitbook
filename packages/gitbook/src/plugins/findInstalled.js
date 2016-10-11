const { OrderedMap } = require('immutable');
const path = require('path');

const Promise = require('../utils/promise');
const fs = require('../utils/fs');
const Plugin = require('../models/plugin');
const PREFIX = require('../constants/pluginPrefix');

/**
 * Validate if a package name is a GitBook plugin
 *
 * @return {Boolean}
 */
function validateId(name) {
    return name && name.indexOf(PREFIX) === 0;
}

/**
 * Read details about a node module.
 * @param {String} modulePath
 * @param {Number} depth
 * @param {String} parent
 * @return {Plugin} plugin
 */
function readModule(modulePath, depth, parent) {
    const pkg = require(path.join(modulePath, 'package.json'));
    const pluginName = pkg.name.slice(PREFIX.length);

    return new Plugin({
        name: pluginName,
        version: pkg.version,
        path: modulePath,
        depth,
        parent
    });
}

/**
 * List all packages installed inside a folder
 *
 * @param {String} folder
 * @param {Number} depth
 * @param {String} parent
 * @return {OrderedMap<String:Plugin>}
 */
function findInstalled(folder, depth = 0, parent = null) {
    // Search for gitbook-plugins in node_modules folder
    const node_modules = path.join(folder, 'node_modules');

    // List all folders in node_modules
    return fs.readdir(node_modules)
    .fail(() => {
        return Promise([]);
    })
    .then((modules) => {
        return Promise.reduce(modules, (results, moduleName) => {
            // Not a gitbook-plugin
            if (!validateId(moduleName)) {
                return results;
            }

            // Read gitbook-plugin package details
            const moduleFolder = path.join(node_modules, moduleName);
            const plugin = readModule(moduleFolder, depth, parent);

            results = results.set(plugin.getName(), plugin);

            return findInstalled(moduleFolder, depth + 1, plugin.getName())
            .then((innerModules) => {
                return results.merge(innerModules);
            });
        }, OrderedMap());
    });
}

module.exports = findInstalled;
