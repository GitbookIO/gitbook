const readInstalled = require('read-installed');
const Immutable = require('immutable');
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
 * List all packages installed inside a folder
 *
 * @param {String} folder
 * @return {OrderedMap<String:Plugin>}
 */
function findInstalled(folder) {
    const options = {
        dev: false,
        log() {},
        depth: 4
    };
    let results = Immutable.OrderedMap();

    function onPackage(pkg, parent) {
        if (!pkg.name) return;

        const name = pkg.name;
        const version = pkg.version;
        const pkgPath = pkg.realPath;
        const depth = pkg.depth;
        const dependencies = pkg.dependencies;

        const pluginName = name.slice(PREFIX.length);

        if (!validateId(name)) {
            if (parent) return;
        } else {
            results = results.set(pluginName, Plugin({
                name: pluginName,
                version,
                path: pkgPath,
                depth,
                parent
            }));
        }

        Immutable.Map(dependencies).forEach(function(dep) {
            onPackage(dep, pluginName);
        });
    }

    // Search for gitbook-plugins in node_modules folder
    const node_modules = path.join(folder, 'node_modules');

    // List all folders in node_modules
    return fs.readdir(node_modules)
    .fail(function() {
        return Promise([]);
    })
    .then(function(modules) {
        return Promise.serie(modules, function(module) {
            // Not a gitbook-plugin
            if (!validateId(module)) {
                return Promise();
            }

            // Read gitbook-plugin package details
            const module_folder = path.join(node_modules, module);
            return Promise.nfcall(readInstalled, module_folder, options)
            .then(function(data) {
                onPackage(data);
            });
        });
    })
    .then(function() {
        // Return installed plugins
        return results;
    });
}

module.exports = findInstalled;
