var path = require('path');

/*
A page represent a parsable file in the book (Markdown, Asciidoc, etc)
*/

function Page(book, filename) {
    if (!(this instanceof Page)) return new Page();

    this.book = book;
    this.filename = filename;
}

// Return the filename of the page with another extension
// "README.md" -> "README.html"
Page.prototype.withExtension = function(ext) {
    return path.join(
        path.dirname(this.filename),
        path.basename(this.filename, path.extname(this.filename)) + ext
    );
};


module.exports = Page;
