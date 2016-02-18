var _ = require('lodash');
var Ignore = require('ignore');
var path = require('path');

var Promise = require('../utils/promise');
var pathUtil = require('../utils/path');
var location = require('../utils/location');
var PluginsManager = require('../plugins');
var TemplateEngine = require('../template');
var gitbook = require('../gitbook');

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
    this.plugins = new PluginsManager(this.book);

    // Create template engine
    this.template = new TemplateEngine(this);

    // Files to ignore in output
    this.ignore = Ignore();
}

// Default extension for output
Output.prototype.defaultExtension = '.html';

// Start the generation, for a parsed book
Output.prototype.generate = function() {
    var that = this;
    var isMultilingual = this.book.isMultilingual();

    return Promise()

    // Load all plugins
    .then(function() {
        return that.plugins.loadAll();
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
            that.log.info.ln('copy asset', filename);
            return that.onAsset(filename);
        })
        .then(function() {
            return Promise.serie(byTypes.page, function(filename) {
                that.log.info.ln('process page', filename);
                return that.onPage(that.book.getPage(filename));
            });
        });
    })

    // Finish the generation
    .then(function() {
        return that.finish();
    })

    .then(function() {
        that.log.info.ln('generation finished with success!');
    });
};

// Prepare the generation
Output.prototype.prepare = function() {
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
};

// Write a page (parsable file), ex: markdown, etc
Output.prototype.onPage = function(page) {
    return page.toHTML(this);
};

// Copy an asset file (non-parsable), ex: images, etc
Output.prototype.onAsset = function(filename) {

};

// Finish the generation
Output.prototype.finish = function() {

};

// Resolve an HTML link
Output.prototype.onRelativeLink = function(currentPage, href) {
    var to = this.book.getPage(href);

    // Replace by an .html link
    if (to) href = this.outputUrl(to.path);

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


// ---- Utilities ----

// Return the complete templating context for a page
Output.prototype.getPageContext = function(page) {
    return _.extend(
        page.getContext(),
        gitbook.getContext(),
        this.book.getContext(),
        this.book.summary.getContext(),
        this.book.glossary.getContext(),
        this.book.config.getContext()
    );
};

// Resolve a file path in the context of a specific page
// Result is an "absolute path relative to the output folder"
Output.prototype.resolveForPage = function(page, href) {
    if (_.isString(page)) page = this.book.getPage(page);

    href = page.relative(href);
    return this.onRelativeLink(page, href);
};

// Filename for output
// READMEs are replaced by index.html
// /test/README.md -> /test/index.html
Output.prototype.outputPath = function(filename, ext) {
    ext = ext || this.defaultExtension;
    var output = filename;

    if (
        path.basename(filename, path.extname(filename)) == 'README' ||
        output == this.book.readme.path
    ) {
        output = path.join(path.dirname(output), 'index'+ext);
    } else {
        output = pathUtil.setExtension(output, ext);
    }

    return output;
};

// Filename for output
// /test/index.html -> /test/
Output.prototype.outputUrl = function(filename, ext) {
    var href = this.outputPath(filename, ext);

    if (path.basename(href) == 'index.html') {
        href = path.dirname(href) + '/';
    }

    return location.normalize(href);
};

module.exports = Output;
