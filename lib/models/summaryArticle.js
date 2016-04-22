var Immutable = require('immutable');

var location = require('../utils/location');

/*
    An article represents an entry in the Summary / table of Contents
*/

var SummaryArticle = Immutable.Record({
    level:      String(),
    title:      String(),
    ref:        String(),
    articles:   Immutable.List()
});

SummaryArticle.prototype.getLevel = function() {
    return this.get('level');
};

SummaryArticle.prototype.getTitle = function() {
    return this.get('title');
};

SummaryArticle.prototype.getRef = function() {
    return this.get('ref');
};

SummaryArticle.prototype.getArticles = function() {
    return this.get('articles');
};

/**
    Get path (without anchor) to the pointing file

    @return {String}
*/
SummaryArticle.prototype.getPath = function() {
    var ref = this.getRef();
    var parts = ref.split('#');

    var pathname = (parts.length > 1? parts.slice(0, -1).join('#') : ref);

    // Normalize path to remove ('./', etc)
    return location.normalize(pathname);
};

/**
    Get anchor for this article (or undefined)

    @return {String}
*/
SummaryArticle.prototype.getAnchor = function() {
    var ref = this.getRef();
    var parts = ref.split('#');

    var anchor = (parts.length > 1? '#' + parts[parts.length - 1] : null);
    return anchor;
};

/**
    Is article pointing to a page of an absolute url

    @return {Boolean}
*/
SummaryArticle.prototype.isPage = function() {
    return !this.isExternal() && this.getRef();
};

/**
    Is article pointing to aan absolute url

    @return {Boolean}
*/
SummaryArticle.prototype.isExternal = function() {
    return location.isExternal(this.getRef());
};

/**
    Create a SummaryArticle

    @param {Object} def
    @return {SummaryArticle}
*/
SummaryArticle.create = function(def) {
    var articles = (def.articles || []).map(function(article) {
        if (article instanceof SummaryArticle) {
            return article;
        }
        return SummaryArticle.create(article);
    });

    return new SummaryArticle({
        title: def.title,
        ref: def.ref || def.path,
        articles: Immutable.List(articles)
    });
};


module.exports = SummaryArticle;
