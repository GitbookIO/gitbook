var _ = require('lodash');
var path = require('path');
var parsers = require('gitbook-parsers');

var error = require('../utils/error');
var pathUtil = require('../utils/path');
var HTMLPipeline = require('./html');

/*
A page represent a parsable file in the book (Markdown, Asciidoc, etc)
*/

function Page(book, filename) {
    if (!(this instanceof Page)) return new Page(book, filename);
    var extension;
    _.bindAll(this);

    this.book = book;
    this.log = this.book.log;

    // Current content
    this.content = '';

    // Relative path to the page
    this.path = filename;

    // Absolute path to the page
    this.rawPath = this.book.resolve(filename);

    // Last modification date
    this.mtime = 0;

    // Can we parse it?
    extension = path.extname(this.path);
    this.parser = parsers.get(extension);
    if (!this.parser) throw error.ParsingError(new Error('Can\'t parse file "'+this.path+'"'));

    this.type = this.parser.name;
}

// Return the filename of the page with another extension
// "README.md" -> "README.html"
Page.prototype.withExtension = function(ext) {
    return pathUtil.setExtension(this.path, ext);
};

// Filename for output
// READMEs are replaced by index.html
Page.prototype.outputPath = function(ext) {
    ext = ext || '.html';
    var output;

    if (
        path.basename(this.path, path.extname(this.path)) == 'README' ||
        output == this.book.readme.path
    ) {
        output = path.join(path.dirname(output), 'index'+ext);
    } else {
        output = pathUtil.setExtension(output, ext);
    }

    return output;
};

// Update content of the page
Page.prototype.update = function(content) {
    this.content = content;
};

// Read the page as a string
Page.prototype.read = function() {
    var that = this;

    return this.book.statFile(this.path)
    .then(function(stat) {
        that.mtime = stat.mtime;
        return that.book.readFile(that.path);
    })
    .then(this.update);
};

// Parse the page and return its content
Page.prototype.parse = function(output) {
    var that = this;

    this.log.debug.ln('start parsing file', this.path);

    return this.read()

    // Pre-process page with parser
    .then(function() {
        return that.parser.page.prepare(that.content)
        .then(that.update);
    })

    // Render template
    .then(function() {
        return that.book.template.renderString(that.content, {
            file: {
                path: that.path,
                mtime: that.mtime
            }
        }, {
            file: that.path
        })
        .then(that.update);
    })

    // Render markup using the parser
    .then(function() {
        return that.parser.page(that.content)
        .then(function(out) {
            var content = _.pluck(out.sections, 'content').join('\n');
            that.update(content);
        });
    })

    // Normalize HTML output
    .then(function() {
        var pipelineOpts = {
            // Replace links to page of summary
            onRelativeLink: _.partial(output.onRelativeLink, that),
            onOutputSVG: _.partial(output.onOutputSVG, that)
        };
        var pipeline = new HTMLPipeline(that.content, pipelineOpts);

        return pipeline.output()
        .then(that.update);
    });
};


module.exports = Page;
