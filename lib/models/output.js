var Immutable = require('immutable');

var Book = require('./book');
var LocationUtils = require('../utils/location');

var Output = Immutable.Record({
    book:       Book(),

    // Name of the generator being used
    generator:  String(),

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

Output.prototype.getGenerator = function() {
    return this.get('generator');
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
    Return a page byt its file path

    @param {String} filePath
    @return {Page|undefined}
*/
Output.prototype.getPage = function(filePath) {
    filePath = LocationUtils.normalize(filePath);

    var pages = this.getPages();
    return pages.get(filePath);
};

/**
    Get root folder for output

    @return {String}
*/
Output.prototype.getRoot = function() {
    return this.getOptions().get('root');
};

/**
    Update state of output

    @param {Map} newState
    @return {Output}
*/
Output.prototype.setState = function(newState) {
    return this.set('state', newState);
};

/**
    Update options

    @param {Map} newOptions
    @return {Output}
*/
Output.prototype.setOptions = function(newOptions) {
    return this.set('options', newOptions);
};

/**
    Return logegr for this output (same as book)

    @return {Logger}
*/
Output.prototype.getLogger = function() {
    return this.getBook().getLogger();
};

module.exports = Output;
