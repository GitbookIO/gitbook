var readInstalled = require('read-installed');
var Immutable = require('immutable');

var Promise = require('../utils/promise');
var Plugin = require('../models/plugin');
var PREFIX = require('../constants/pluginPrefix');

/**
    Validate if a package name is a GitBook plugin

    @return {Boolean}
*/
function validateId(name) {
    return name && name.indexOf(PREFIX) === 0;
}


/**
    List all packages installed inside a folder

    @param {String} folder
    @return {OrderedMap<String:Plugin>}
*/
function findInstalled(folder) {
    var options = {
        dev: false,
        log: function() {},
        depth: 4
    };
    var results = Immutable.OrderedMap();

    function onPackage(pkg, isRoot) {
        if (!pkg.name) return;

        var name = pkg.name;
        var version = pkg.version;
        var pkgPath = pkg.realPath;
        var depth = pkg.depth;
        var dependencies = pkg.dependencies;

        var pluginName = name.slice(PREFIX.length);

        if (!validateId(name)){
            if (!isRoot) return;
        } else {
            results = results.set(pluginName, Plugin({
                name: pluginName,
                version: version,
                path: pkgPath,
                depth: depth
            }));
        }

        Immutable.Map(dependencies).forEach(function(dep) {
            onPackage(dep);
        });
    }

    return Promise.nfcall(readInstalled, folder, options)
    .then(function(data) {
        onPackage(data, true);
        return results;
    });
}

module.exports = findInstalled;
