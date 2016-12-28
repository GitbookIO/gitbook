const Immutable = require('immutable');

const SummaryArticle = require('./summaryArticle');

/*
    A part represents a section in the Summary / table of Contents
*/

const SummaryPart = Immutable.Record({
    level:      String(),
    title:      String(),
    articles:   Immutable.List()
});

SummaryPart.prototype.getLevel = function() {
    return this.get('level');
};

SummaryPart.prototype.getTitle = function() {
    return this.get('title');
};

SummaryPart.prototype.getArticles = function() {
    return this.get('articles');
};

/**
 * Create a new level for a new child article
 *
 * @return {String}
 */
SummaryPart.prototype.createChildLevel = function() {
    const level       = this.getLevel();
    const subArticles = this.getArticles();
    const childLevel  = level + '.' + (subArticles.size + 1);

    return childLevel;
};

/**
 * Create a SummaryPart
 *
 * @param {Object} def
 * @return {SummaryPart}
 */
SummaryPart.create = function(def, level) {
    const articles = (def.articles || []).map((article, i) => {
        if (article instanceof SummaryArticle) {
            return article;
        }
        return SummaryArticle.create(article, [level, i + 1].join('.'));
    });

    return new SummaryPart({
        level: String(level),
        title: def.title,
        articles: Immutable.List(articles)
    });
};

module.exports = SummaryPart;
