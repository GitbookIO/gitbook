var _ = require('lodash');
var fs = require('fs');
var Ignore = require('ignore');

var Promise = require('./utils/promise');
var pathUtil = require('./utils/path');
var generators = require('./generators');
var PluginsManager = require('./plugins');

function Output(book, type) {
    if (!generators[type]) throw new Error('Generator not found"' + type + '"');

    this.book = book;
    this.log = this.book.log;

    this.type = type;
    this.plugins = new PluginsManager(book);
    this.generator = new generators[type](this, type);

    // Files to ignore in output
    this.ignore = Ignore();
    this.ignore.addPattern(_.compact([
        '.gitignore',
        '.ignore',
        '.bookignore',

        // The configuration file should not be copied in the output
        this.book.config.filename
    ]));
}


// Resolve a file in the output directory
Output.prototype.resolve = function(filename) {
    return pathUtil.resolveInRoot.apply(null, [this.book.config.get('output')].concat(_.toArray(arguments)));
};

// Write a file/buffer to the output folder
Output.prototype.writeFile = function(filename, buf) {
    filename = this.resolve(filename);
    return Promise.nfcall(fs.writeFile, filename, buf);
};

// Start the generation, for a parsed book
Output.prototype.generate = function() {
    var that = this;
    var isMultilingual = this.book.isMultilingual();

    return Promise()

    // Load all plugins
    .then(function() {
        that.log.info.ln('Loading and preparing plugins');

        var plugins = _.pluck(that.book.config.get('plugins'), 'name');

        return that.plugins.load(plugins);
    })

    // Initialize the generation
    .then(function() {
        return that.generator.prepare();
    })

    // Process all files
    .then(function() {
        return that.book.fs.listAllFiles(that.book.root);
    })
    .then(function(files) {
        return Promise.serie(files, function(filename) {
            // Ignore file present in a language book
            if (isMultilingual && that.book.isInLanguageBook(filename)) return;

            // Process file as page or asset
            if (that.book.hasPage(filename)) {
                return that.generator.writePage(that.book.getPage(filename));
            } else {
                return that.generator.writeAsset(filename);
            }
        });
    })

    // Finish the generation
    .then(function() {
        return that.generator.finish();
    });
};

module.exports = Output;
