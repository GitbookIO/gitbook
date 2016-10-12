const { Record, OrderedMap, Map, List } = require('immutable');

const Git = require('../utils/git');
const LocationUtils = require('../utils/location');
const Book = require('./book');
const URIIndex = require('./uriIndex');

const DEFAULTS = {
    book:      new Book(),
    // Name of the generator being used
    generator: String(),
    // Map of plugins to use (String -> Plugin)
    plugins:   OrderedMap(),
    // Map pages to generation (String -> Page)
    pages:     OrderedMap(),
    // List assets (String)
    assets:    List(),
    // Option for the generation
    options:   Map(),
    // Internal state for the generation
    state:     Map(),
    // Index of urls
    urls:      new URIIndex(),
    // Git repositories manager
    git:       new Git()
};

class Output extends Record(DEFAULTS) {
    getBook() {
        return this.get('book');
    }

    getGenerator() {
        return this.get('generator');
    }

    getPlugins() {
        return this.get('plugins');
    }

    getPages() {
        return this.get('pages');
    }

    getOptions() {
        return this.get('options');
    }

    getAssets() {
        return this.get('assets');
    }

    getState() {
        return this.get('state');
    }

    getURLIndex() {
        return this.get('urls');
    }

    /**
     * Return a page byt its file path
     *
     * @param {String} filePath
     * @return {Page|undefined}
     */
    getPage(filePath) {
        filePath = LocationUtils.normalize(filePath);

        const pages = this.getPages();
        return pages.get(filePath);
    }

    /**
     * Get root folder for output.
     * @return {String}
     */
    getRoot() {
        return this.getOptions().get('root');
    }

    /**
     * Update state of output
     *
     * @param {Map} newState
     * @return {Output}
     */
    setState(newState) {
        return this.set('state', newState);
    }

    /**
     * Update options
     *
     * @param {Map} newOptions
     * @return {Output}
     */
    setOptions(newOptions) {
        return this.set('options', newOptions);
    }

    /**
     * Return logegr for this output (same as book)
     *
     * @return {Logger}
     */
    getLogger() {
        return this.getBook().getLogger();
    }
}

module.exports = Output;
