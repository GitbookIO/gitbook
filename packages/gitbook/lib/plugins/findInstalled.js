var readInstalled = require('read-installed');
var Immutable = require('immutable');
var path = require('path');

var Promise = require('../utils/promise');
var fs = require('../utils/fs');
var Plugin = require('../models/plugin');
var PREFIX = require('../constants/pluginPrefix');

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
    var options = {
        dev: false,
        log: function() {},
        depth: 4
    };
    var results = Immutable.OrderedMap();

    function onPackage(pkg, parent) {
        if (!pkg.name) return;

        var name = pkg.name;
        var version = pkg.version;
        var pkgPath = pkg.realPath;
        var depth = pkg.depth;
        var dependencies = pkg.dependencies;

        var pluginName = name.slice(PREFIX.length);

        if (!validateId(name)){
            if (parent) return;
        } else {
            results = results.set(pluginName, Plugin({
                name: pluginName,
                version: version,
                path: pkgPath,
                depth: depth,
                parent: parent
            }));
        }

        Immutable.Map(dependencies).forEach(function(dep) {
            onPackage(dep, pluginName);
        });
    }

    // Search for gitbook-plugins in node_modules folder
    var node_modules = path.join(folder, 'node_modules');

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
            var module_folder = path.join(node_modules, module);
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
