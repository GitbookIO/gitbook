
/*
A page represent a parsable file in the book (Markdown, Asciidoc, etc)
*/

function Page(book, filename) {
    if (!(this instanceof Page)) return new Page();

    this.book = book;
    this.filename = filename;
}



module.exports = Page;
