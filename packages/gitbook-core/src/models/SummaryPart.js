const { Record, List } = require('immutable');
const SummaryArticle = require('./SummaryArticle');

class SummaryPart extends Record({
    title:    '',
    articles: List()
}) {
    constructor(state) {
        super({
            ...state,
            articles: (new List(state.articles))
                .map(article => new SummaryArticle(article))
        });
    }
}

module.exports = SummaryPart;
