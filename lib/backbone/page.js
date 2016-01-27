
/*
A page represent a parsable file in the book (Markdown, Asciidoc, etc)
*/

function Page(book, filename) {
    if (!(this instanceof Page)) return new Page();

    this.book = book;
    this.filename = filename;
}

// Return the filename of the page with another extension
Page.prototype.withExtension = function(ext) {
    return
};


module.exports = Page;
