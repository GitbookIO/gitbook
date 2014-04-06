var Q = require("q");
var _ = require("lodash");

var lunr = require('lunr');
var marked = require('marked');
var textRenderer = require('marked-text-renderer');


function Indexer() {
    if(!(this instanceof Indexer)) {
        return new Indexer();
    }

    _.bindAll(this);

    // Setup lunr index
    this.idx = lunr(function () {
        this.ref('url');

        this.field('title', { boost: 10 });
        this.field('body');
    });

    this.renderer = textRenderer();
}

Indexer.prototype.text = function(nodes) {
    // Copy section
    var section = _.toArray(nodes);

    // marked's Render expects this, we don't use it yet
    section.links = {};

    var options = _.extend({}, marked.defaults, {
        renderer: this.renderer
    });

    return marked.parser(section, options);
};

Indexer.prototype.addSection = function(path, section) {
    var url = [path, section.id].join('#');

    var title = this.text(
        _.filter(section, {'type': 'heading'})
    );

    var body = this.text(
        _.omit(section, {'type': 'heading'})
    );

    // Add to lunr index
    this.idx.add({
        url: url,
        title: title,
        body: body,
    });
};

Indexer.prototype.add = function(lexedPage, url) {
    var sections = lexedPage;

    _.map(sections, _.partial(this.addSection, url));
};

Indexer.prototype.dump = function() {
    return JSON.stringify(this.idx);
};

// Exports
module.exports = Indexer;
