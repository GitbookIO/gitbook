var Immutable = require('immutable');

var SummaryArticle = require('./summaryArticle');

/*
    A part represents a section in the Summary / table of Contents
*/

var SummaryPart = Immutable.Record({
    title:      String(),
    articles:   Immutable.List()
});

SummaryPart.prototype.getTitle = function() {
    return this.get('title');
};

SummaryPart.prototype.getArticles = function() {
    return this.get('articles');
};

/**
    Create a SummaryPart

    @param {Object} def
    @return {SummaryPart}
*/
SummaryPart.create = function(def) {
    var articles = (def.articles || []).map(function(article) {
        if (article instanceof SummaryArticle) {
            return article;
        }
        return SummaryArticle.create(article);
    });

    return new SummaryPart({
        title: def.title,
        articles: Immutable.List(articles)
    });
};

module.exports = SummaryPart;
