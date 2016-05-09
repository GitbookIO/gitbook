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
}, 'SummaryArticle');

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
    Return how deep the article is

    @return {Number}
*/
SummaryArticle.prototype.getDepth = function() {
    return this.getLevel().split('.').length;
};

/**
    Get path (without anchor) to the pointing file

    @return {String}
*/
SummaryArticle.prototype.getPath = function() {
    var ref = this.getRef();

    // Don't normalize path for Git content references
    if (this.isConRef()) {
        return ref;
    }

    if (this.isExternal()) {
        return undefined;
    }

    if (!ref) {
        return undefined;
    }

    var parts = ref.split('#');

    var pathname = (parts.length > 1? parts.slice(0, -1).join('#') : ref);

    // Normalize path to remove ('./', etc)
    return location.normalize(pathname);
};

/**
    Return url if article is external

    @return {String}
*/
SummaryArticle.prototype.getUrl = function() {
    return this.isExternal()? this.getRef() : undefined;
};

/**
    Get anchor for this article (or undefined)

    @return {String}
*/
SummaryArticle.prototype.getAnchor = function() {
    var ref = this.getRef();
    var parts = ref.split('#');

    var anchor = (parts.length > 1? '#' + parts[parts.length - 1] : undefined);
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
    Is article a git content reference

    @return {Boolean}
*/
SummaryArticle.prototype.isConRef = function() {
    return location.isGitUrl(this.getRef());
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
        return SummaryArticle.create(article, [level, i + 1].join('.'));
    });

    return new SummaryArticle({
        level: level,
        title: def.title,
        ref: def.ref || def.path || '',
        articles: Immutable.List(articles)
    });
};


/**
    Find an article from a base one

    @param {Article|Part} base
    @param {Function(article)} iter
    @return {Article}
*/
SummaryArticle.findArticle = function(base, iter) {
    var articles = base.getArticles();

    return articles.reduce(function(result, article) {
        if (result) return result;

        if (iter(article)) {
            return article;
        }

        return SummaryArticle.findArticle(article, iter);
    }, null);
};


module.exports = SummaryArticle;
