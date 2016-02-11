var _ = require('lodash');
var path = require('path');
var parsers = require('gitbook-parsers');

var error = require('../utils/error');
var Promise = require('../utils/promise');
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
    return path.join(
        path.dirname(this.path),
        path.basename(this.path, path.extname(this.path)) + ext
    );
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
Page.prototype.parse = function(opts) {
    var that = this;

    opts = _.defaults(opts || {}, {

    });


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
        .then(that.update);
    })

    // Normalize HTML output
    .then(function() {
        return Promise.map(that.content.sections, function(section) {
            var pipeline = new HTMLPipeline(section.content, opts);

            return pipeline.output()
            .then(function(content) {
                return {
                    content: content
                };
            });
        });
    });
};


module.exports = Page;
