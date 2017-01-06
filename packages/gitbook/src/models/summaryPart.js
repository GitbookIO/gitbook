const { Record, List } = require('immutable');
const SummaryArticle = require('./summaryArticle');

const DEFAULTS = {
    level:    String(),
    title:    String(),
    articles: List()
};

/**
 * A part represents a section in the Summary / table of Contents.
 * @type {Class}
 */

class SummaryPart extends Record(DEFAULTS) {
    getLevel() {
        return this.get('level');
    }

    getTitle() {
        return this.get('title');
    }

    getArticles() {
        return this.get('articles');
    }

    /**
     * Create a new level for a new child article
     *
     * @return {String}
     */
    createChildLevel() {
        const { level, articles } = this;
        return `${level}.${articles.size + 1}`;
    }

    /**
     * Create a SummaryPart
     *
     * @param {Object} def
     * @return {SummaryPart}
     */
    static create(def, level) {
        const articles = (def.articles || []).map((article, i) => {
            if (article instanceof SummaryArticle) {
                return article;
            }
            return SummaryArticle.create(article, [level, i + 1].join('.'));
        });

        return new SummaryPart({
            level: String(level),
            title: def.title,
            articles: List(articles)
        });
    }
}

module.exports = SummaryPart;
