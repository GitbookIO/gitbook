var _ = require('lodash');
var Ignore = require('ignore');
var path = require('path');

var Promise = require('./utils/promise');
var pathUtil = require('./utils/path');
var error = require('./utils/error');
var fs = require('./utils/fs');
var generators = require('./generators');
var PluginsManager = require('./plugins');

function Output(book, type) {
    if (!generators[type]) throw error.GeneratorNotFoundError({ generator: type });

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
        this.book.config.path
    ]));
}

// Return path to the root folder
Output.prototype.root = function(filename) {
    return path.resolve(process.cwd(), this.book.config.get('output'));
};

// Resolve a file in the output directory
Output.prototype.resolve = function(filename) {
    return pathUtil.resolveInRoot.apply(null, [this.root()].concat(_.toArray(arguments)));
};

// Write a file/buffer to the output folder
Output.prototype.writeFile = function(filename, buf) {
    var that = this;

    return Promise()
    .then(function() {
        filename = that.resolve(filename);
        var folder = path.dirname(filename);

        // Ensure fodler exists
        return fs.mkdirp(folder);
    })

    // Write the file
    .then(function() {
        return fs.writeFile(filename, buf);
    });
};

// Copy a file to the output
Output.prototype.copyFile = function(from, to) {
    var that = this;

    return Promise()
    .then(function() {
        to = that.resolve(to);

        return fs.copy(from, to);
    });
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

    // Create the output folder
    .then(function() {
        return fs.mkdirp(that.root());
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
