var _ = require("lodash");
var kramed = require('kramed');
var textRenderer = require('kramed-text-renderer');

var entryId = require('../../parse/glossary').entryId;


function Indexer(glossary) {
    if(!(this instanceof Indexer)) {
        return new Indexer(glossary);
    }

    _.bindAll(this);

    this.glossary = glossary || [];

    this.glossaryTerms = _.pluck(this.glossary, "id");

    // Regex for searching for terms through body
    this.termsRegex = new RegExp(
        // Match any of the terms
        "("+
            this.glossaryTerms.map(regexEscape).join('|') +
        ")",

        // Flags
        "gi"
    );

    // page url => terms
    this.idx = {
        /*
        "a/b.html": ["one word", "second word"]
        */
    };

    // term => page urls
    this.invertedIdx = {
        /*
        "word1": ["page1.html", "page2.html"]
        */
    };

    // Use text renderer
    this.renderer = textRenderer();
}

Indexer.prototype.text = function(nodes) {
    // Copy section
    var section = _.toArray(nodes);

    // kramed's Render expects this, we don't use it yet
    section.links = {};

    var options = _.extend({}, kramed.defaults, {
        renderer: this.renderer
    });

    return kramed.parser(section, options);
};

// Add page to glossary index
Indexer.prototype.add = function(sections, url) {
    if(!(this.glossary && this.glossary.length > 0)) {
        return;
    }

    var textblob =
    _.where(sections, { type: 'normal' })
    .map(this.text)
    .join('\n');

    var matches = _(textblob.match(this.termsRegex) || [])
    .map(entryId)
    .uniq()
    .value();

    // Add idx for book
    this.idx[url] = matches;

    // Add to inverted idx
    matches.forEach(function(match) {
        if(!this.invertedIdx[match]) {
            this.invertedIdx[match] = [];
        }
        this.invertedIdx[match].push(url);
    }.bind(this));
};

// Dump index as a string
Indexer.prototype.dump = function() {
    return JSON.stringify(this.idx);
};


function regexEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// Exports
module.exports = Indexer;
