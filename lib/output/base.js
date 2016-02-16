var _ = require('lodash');
var Ignore = require('ignore');
var path = require('path');

var Promise = require('../utils/promise');
var PluginsManager = require('../plugins');
var TemplateEngine = require('../template');

/*
Output is like a stream interface for a parsed book
to output "something".

The process is mostly on the behavior of "onPage" and "onAsset"
*/

function Output(book) {
    _.bindAll(this);

    this.book = book;
    this.log = this.book.log;

    // Create plugins manager
    this.plugins = new PluginsManager(book);

    // Create template engine
    this.template = new TemplateEngine(this);

    // Files to ignore in output
    this.ignore = Ignore();
    this.ignore.addPattern(_.compact([
        '.gitignore',
        '.ignore',
        '.bookignore',

        // The configuration file should not be copied in the output
        this.book.config.path,

        // Structure file to ignore
        this.book.summary.path,
        this.book.langs.path
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

    // We want to process assets first, then pages
    // Since pages can have logic based on existance of assets
    .then(function(files) {
        // Split into pages/assets
        var byTypes = _.chain(files)
            .filter(that.ignore.createFilter())

            // Ignore file present in a language book
            .filter(function(filename) {
                return !(isMultilingual && that.book.isInLanguageBook(filename));
            })

            .groupBy(function(filename) {
                return (that.book.hasPage(filename)? 'page' : 'asset');
            })

            .value();

        return Promise.serie(byTypes.asset, function(filename) {
            return that.onAsset(filename);
        })
        .then(function() {
            return Promise.serie(byTypes.page, function(filename) {
                return that.onPage(that.book.getPage(filename));
            });
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
    return page.toHTML(this);
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

// Output a SVG buffer as a file
Output.prototype.onOutputSVG = function(page, svg) {
    return null;
};

// Output an image as a file
// Normalize the relative link
Output.prototype.onOutputImage = function(page, imgFile) {
    return page.relative(imgFile);
};

// Read a template by its source URL
Output.prototype.onGetTemplate = function(sourceUrl) {
    throw new Error('template not found '+sourceUrl);
};

// Generate a source URL for a template
Output.prototype.onResolveTemplate = function(from, to) {
    return path.resolve(path.dirname(from), to);
};

// Finish the generation
Output.prototype.finish = function() {

};

Output.createMixin = function(def) {

};

module.exports = Output;
