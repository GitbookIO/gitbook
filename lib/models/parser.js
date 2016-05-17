var Immutable = require('immutable');
var Promise = require('../utils/promise');

var Parser = Immutable.Record({
    name:           String(),

    // List of extensions that can be processed using this parser
    extensions:     Immutable.List(),

    // Parsing functions
    readme:         Function(),
    langs:          Function(),
    summary:        Function(),
    glossary:       Function(),
    page:           Function(),
    inline:         Function()
});

Parser.prototype.getName = function() {
    return this.get('name');
};

Parser.prototype.getExtensions = function() {
    return this.get('extensions');
};

// PARSE

Parser.prototype.parseReadme = function(content) {
    var readme = this.get('readme');
    return Promise(readme(content));
};

Parser.prototype.parseSummary = function(content) {
    var summary = this.get('summary');
    return Promise(summary(content));
};

Parser.prototype.parseGlossary = function(content) {
    var glossary = this.get('glossary');
    return Promise(glossary(content));
};

Parser.prototype.preparePage = function(content) {
    var page = this.get('page');
    if (!page.prepare) {
        return Promise(content);
    }

    return Promise(page.prepare(content));
};

Parser.prototype.parsePage = function(content) {
    var page = this.get('page');
    return Promise(page(content));
};

Parser.prototype.parseInline = function(content) {
    var inline = this.get('inline');
    return Promise(inline(content));
};

Parser.prototype.parseLanguages = function(content) {
    var langs = this.get('langs');
    return Promise(langs(content));
};

Parser.prototype.parseInline = function(content) {
    var inline = this.get('inline');
    return Promise(inline(content));
};

// TO TEXT

Parser.prototype.renderLanguages = function(content) {
    var langs = this.get('langs');
    return Promise(langs.toText(content));
};

Parser.prototype.renderSummary = function(content) {
    var summary = this.get('summary');
    return Promise(summary.toText(content));
};

Parser.prototype.renderGlossary = function(content) {
    var glossary = this.get('glossary');
    return Promise(glossary.toText(content));
};

/**
    Test if this parser matches an extension

    @param {String} ext
    @return {Boolean}
*/
Parser.prototype.matchExtension = function(ext) {
    var exts = this.getExtensions();
    return exts.includes(ext.toLowerCase());
};

/**
    Create a new parser using a module (gitbook-markdown, etc)

    @param {String} name
    @param {Array<String>} extensions
    @param {Object} module
    @return {Parser}
*/
Parser.create = function(name, extensions, module) {
    return new Parser({
        name: name,
        extensions: Immutable.List(extensions),
        readme:         module.readme,
        langs:          module.langs,
        summary:        module.summary,
        glossary:       module.glossary,
        page:           module.page,
        inline:         module.inline
    });
};

module.exports = Parser;
