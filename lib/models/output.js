var Immutable = require('immutable');

var Book = require('./book');

var Output = Immutable.Record({
    book:       Book(),

    // Map of plugins to use (String -> Plugin)
    plugins:    Immutable.OrderedMap(),

    // Map pages to generation (String -> Page)
    pages:      Immutable.OrderedMap(),

    // List assets (String)
    assets:     Immutable.List(),

    // Option for the generation
    options:    Immutable.Map(),

    // Internal state for the generation
    state:      Immutable.Map()
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

Output.prototype.getState = function() {
    return this.get('state');
};

/**
    Return logegr for this output (same as book)

    @return {Logger}
*/
Output.prototype.getLogger = function() {
    return this.getBook().getLogger();
};

/**
    Update state of output

    @param {Output} output
    @param {Map} newState
    @return {Output}
*/
Output.updateState = function(output, newState) {
    return output.set('state', newState);
};

module.exports = Output;
