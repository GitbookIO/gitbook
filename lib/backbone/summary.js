var _ = require('lodash');
var util = require('util');
var url = require('url');

var location = require('../utils/location');
var BackboneFile = require('./file');


/*
An article represent an entry in the Summary.
It's defined by a title, a reference, and children articles, the reference (ref) can be a filename + anchor or an external file (optional)
*/
function TOCArticle(summary, title, ref, articles, parent) {
    this.summary = summary;
    this.title = title;

    if (ref && location.isExternal(ref)) {
        throw new Error('SUMMARY can only contains relative locations');
    }
    if (!title) {
        throw new Error('SUMMARY entries should have an non-empty title');
    }

    var parts = url.parse(ref);
    this.filename = parts.pathname;
    this.anchor = parts.hash;

    this.articles = _.map(articles || [], function(article) {
        if (article instanceof TOCArticle) return article;
        return new TOCArticle(article.title, article.ref, article.articles, this);
    }, this);
}

// Iterate over all articles in this articles
TOCArticle.prototype.walk = function(iter) {
    _.each(this.articles, function(article) {
        iter(article);
        article.walk(iter);
    });
};

// Return true if is pointing to a file
TOCArticle.prototype.hasLocation = function() {
    return Boolean(this.filename);
};

// Return true if has children
TOCArticle.prototype.hasChildren = function() {
    return this.articles.length > 0;
};

/*
A part of a ToC is a composed of a tree of articles.
*/
function TOCPart(summary, part) {
    var that = this;

    this.summary = summary;
    this.articles = _.map(part.articles || part.chapters, function(article) {
        return new TOCArticle(that.summary, article.title, article.path, article.articles);
    });
}

// Iterate over all entries of the part
TOCPart.prototype.walk = function(iter) {
    _.each(this.articles, function(article) {
        iter(article);
        article.walk(iter);
    });
};

/*
A summary is composed of a list of parts, each composed wit a tree of articles.
*/
function Summary() {
    BackboneFile.apply(this, arguments);

    this.parts = [];
    this._length = 0;
}
util.inherits(Summary, BackboneFile);

Summary.prototype.type = 'summary';

// Parse the summary content
Summary.prototype.parse = function(content) {
    var that = this;

    return this.parser.summary(content)

    // TODO: update GitBook's parsers to return a list of parts
    .then(function(part) {
        that.parts = [new TOCPart(that, part)];

        // Update count of articles
        that._length = 0;
        that.walk(function() {
            that._length += 1;
        });
    });
};

// Iterate over all entries of the summary
// iter is called with an TOCArticle
Summary.prototype.walk = function(iter) {
    _.each(this.parts, function(part) {
        part.walk(iter);
    });
};

// Return the count of articles in the summary
Summary.prototype.count = function() {
    return this._length;
};

module.exports = Summary;
