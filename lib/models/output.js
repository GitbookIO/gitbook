var Immutable = require('immutable');

var Book = require('./book');

var Output = Immutable.Record({
    book:       Book(),
    plugins:    Immutable.OrderedMap(),
    pages:      Immutable.OrderedMap(),
    assets:     Immutable.List(),
    options:    Immutable.Map()
});

Output.prototype.getBook = function() {
    return this.get('book');
};

Output.prototype.getPlugins = function() {
    return this.get('plugins');
};

Output.prototype.getPages = function() {
    return this.get('pages');
};

Output.prototype.getOptions = function() {
    return this.get('options');
};

Output.prototype.getAssets = function() {
    return this.get('assets');
};

/**
    Create an Output instance from a book and a set of options

    @param {Book} book
    @param {Object} options
    @return {Output}
*/
Output.createForBook = function(book, options) {
    return new Output({
        book: book,
        options: options
    });
};

module.exports = Output;
