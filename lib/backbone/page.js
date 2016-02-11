var _ = require('lodash');
var path = require('path');
var parsers = require('gitbook-parsers');

var error = require('../utils/error');

/*
A page represent a parsable file in the book (Markdown, Asciidoc, etc)
*/

function Page(book, filename) {
    if (!(this instanceof Page)) return new Page(book, filename);
    var extension;
    _.bindAll(this);

    this.book = book;
    this.log = this.book.log;

    this.content = '';
    this.path = filename;
    this.rawPath = this.book.resolve(filename);

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
    return this.book.readFile(this.path)
        .then(this.update);
};

// Parse the page and return its content
Page.prototype.parse = function() {
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
                mtime: 0 //todo: stat.mtime
            }
        }, {
            file: that.path
        })
        .then(that.update);
    })

    // Render markup
    .then(function() {
        return that.parser.page(that.content);
    });
};


module.exports = Page;
