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
    Return an article by its level

    @param {String} level
    @return {Article}
*/
SummaryArticle.prototype.getByLevel = function(level) {
    return SummaryArticle.getByLevel(this, level);
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
SummaryArticle.create = function(def, level) {
    var articles = (def.articles || []).map(function(article, i) {
        if (article instanceof SummaryArticle) {
            return article;
        }
        return SummaryArticle.create(article, [level, i].join('.'));
    });

    return new SummaryArticle({
        level: level,
        title: def.title,
        ref: def.ref || def.path,
        articles: Immutable.List(articles)
    });
};


/**
    Return an article by its level

    @param {Article|Part} base
    @param {String} level
    @param {String} method
    @return {Article}
*/
SummaryArticle.getByLevel = function(base, level, method) {
    method = method || 'getArticles';
    var articles = base[method]();
    var levelParts = level.split('.');
    var baseLevel = levelParts.shift();

    var result = articles.find(function(a) {
        return a.getLevel() === baseLevel;
    });

    if (!result) {
        return undefined;
    }
    if (levelParts.length === 0) {
        return result;
    }

    return SummaryArticle.getByLevel(result, levelParts.join('.'));
};

module.exports = SummaryArticle;
