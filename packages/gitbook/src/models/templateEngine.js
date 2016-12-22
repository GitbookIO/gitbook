const nunjucks = require('nunjucks');
const { Record, Map, List } = require('immutable');

const DEFAULTS = {
    // List of {TemplateBlock}
    blocks:     List(),
    // Map of Extension
    extensions: Map(),
    // Map of filters: {String} name -> {Function} fn
    filters:    Map(),
    // Map of globals: {String} name -> {Mixed}
    globals:    Map(),
    // Context for filters / blocks
    context:    Object(),
    // Nunjucks loader
    loader:     nunjucks.FileSystemLoader('views')
};

class TemplateEngine extends Record(DEFAULTS) {
    getBlocks() {
        return this.get('blocks');
    }

    getGlobals() {
        return this.get('globals');
    }

    getFilters() {
        return this.get('filters');
    }

    getShortcuts() {
        return this.get('shortcuts');
    }

    getLoader() {
        return this.get('loader');
    }

    getContext() {
        return this.get('context');
    }

    getExtensions() {
        return this.get('extensions');
    }

    /**
     * Return a block by its name (or undefined).
     * @param {String} name
     * @return {TemplateBlock} block?
     */
    getBlock(name) {
        const blocks = this.getBlocks();
        return blocks.find(function(block) {
            return block.getName() === name;
        });
    }

    /**
     * Return a nunjucks environment from this configuration
     * @return {Nunjucks.Environment} env
     */
    toNunjucks() {
        const loader = this.getLoader();
        const blocks = this.getBlocks();
        const filters = this.getFilters();
        const globals = this.getGlobals();
        const extensions = this.getExtensions();
        const context = this.getContext();

        const env = new nunjucks.Environment(
            loader,
            {
                // Escaping is done after by the asciidoc/markdown parser
                autoescape: false,

                // Syntax
                tags: {
                    blockStart:    '{%',
                    blockEnd:      '%}',
                    variableStart: '{{',
                    variableEnd:   '}}',
                    commentStart:  '{###',
                    commentEnd:    '###}'
                }
            }
        );

        // Add filters
        filters.forEach(function(filterFn, filterName) {
            env.addFilter(filterName, filterFn.bind(context));
        });

        // Add blocks
        blocks.forEach(function(block) {
            const extName = block.getExtensionName();
            const Ext = block.toNunjucksExt(context);

            env.addExtension(extName, new Ext());
        });

        // Add globals
        globals.forEach(function(globalValue, globalName) {
            env.addGlobal(globalName, globalValue);
        });

        // Add other extensions
        extensions.forEach(function(ext, extName) {
            env.addExtension(extName, ext);
        });

        return env;
    }

    /**
     * Create a template engine.
     * @param {Object} def
     * @return {TemplateEngine} engine
     */
    static create(def) {
        return new TemplateEngine({
            blocks:     List(def.blocks || []),
            extensions: Map(def.extensions || {}),
            filters:    Map(def.filters || {}),
            globals:    Map(def.globals || {}),
            context:    def.context,
            loader:     def.loader
        });
    }
}

module.exports = TemplateEngine;
