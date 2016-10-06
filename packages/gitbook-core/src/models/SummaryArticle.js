const { Record, List } = require('immutable');

const DEFAULTS = {
    title:    '',
    depth:    0,
    path:     '',
    ref:      '',
    level:    '',
    articles: List()
};

class SummaryArticle extends Record(DEFAULTS) {
    constructor(article) {
        super({
            ...article,
            articles: (new List(article.articles))
                .map(art => new SummaryArticle(art))
        });
    }

    /**
     * Return true if article is an instance of SummaryArticle
     * @param {Mixed} article
     * @return {Boolean}
     */
    static is(article) {
        return (article instanceof SummaryArticle);
    }
}

module.exports = SummaryArticle;
