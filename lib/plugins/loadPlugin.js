var path = require('path');
var resolve = require('resolve');
var Immutable = require('immutable');

var Promise = require('../utils/promise');
var error = require('../utils/error');
var timing = require('../utils/timing');

var validatePlugin = require('./validatePlugin');

// Return true if an error is a "module not found"
// Wait on https://github.com/substack/node-resolve/pull/81 to be merged
function isModuleNotFound(err) {
    return err.code == 'MODULE_NOT_FOUND' || err.message.indexOf('Cannot find module') >= 0;
}

/**
    Load a plugin in a book

    @param {Book} book
    @param {Plugin} plugin
    @param {String} pkgPath (optional)
    @return {Promise<Plugin>}
*/
function loadPlugin(book, plugin) {
    var logger = book.getLogger();

    var name = plugin.getName();
    var pkgPath = plugin.getPath();

    // Try loading plugins from different location
    var p = Promise()
    .then(function() {
        var packageContent;
        var packageMain;
        var content;

        // Locate plugin and load package.json
        try {
            var res = resolve.sync('./package.json', { basedir: pkgPath });

            pkgPath = path.dirname(res);
            packageContent = require(res);
        } catch (err) {
            if (!isModuleNotFound(err)) throw err;

            packageContent = undefined;
            content = undefined;

            return;
        }

        // Locate the main package
        try {
            var indexJs = path.normalize(packageContent.main || 'index.js');
            packageMain = resolve.sync('./' + indexJs, { basedir: pkgPath });
        } catch (err) {
            if (!isModuleNotFound(err)) throw err;
            packageMain = undefined;
        }

        // Load plugin JS content
        if (packageMain) {
            try {
                content = require(packageMain);
            } catch(err) {
                throw new error.PluginError(err, {
                    plugin: name
                });
            }
        }

        // Update plugin
        return plugin.merge({
            'package': Immutable.fromJS(packageContent),
            'content': Immutable.fromJS(content || {})
        });
    })

    .then(validatePlugin);

    p = timing.measure('plugin.load', p);

    logger.info('loading plugin "' + name + '"... ');
    return logger.info.promise(p);
}


module.exports = loadPlugin;
