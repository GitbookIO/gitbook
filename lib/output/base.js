var _ = require('lodash');
var Ignore = require('ignore');

var Promise = require('../utils/promise');
var PluginsManager = require('../plugins');

/*
Output is like a stream interface for a parsed book
to output "something".

The process is mostly on the behavior of "onPage" and "onAsset"
*/

function Output(book, type) {
    _.bindAll(this);

    this.book = book;
    this.log = this.book.log;

    this.type = type;
    this.plugins = new PluginsManager(book);

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
        return that.prepare();
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
                return that.onPage(that.book.getPage(filename));
            } else {
                return that.onAsset(filename);
            }
        });
    })

    // Finish the generation
    .then(function() {
        return that.finish();
    });
};

// Prepare the generation
Output.prototype.prepare = function() {

};

// Write a page (parsable file), ex: markdown, etc
Output.prototype.onPage = function(page) {

};

// Copy an asset file (non-parsable), ex: images, etc
Output.prototype.onAsset = function(filename) {

};

// Resolve an HTML link
Output.prototype.onRelativeLink = function(currentPage, href) {
    var to = this.book.getPage(href);
    if (to) return to.outputPath();

    return href;
};

// Output a SVG as a file
Output.prototype.onOutputSVG = function(page, svg) {
    return null;
};

// Finish the generation
Output.prototype.finish = function() {

};


module.exports = Output;
