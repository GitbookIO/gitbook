const { Record, List } = require('immutable');
const FileState = require('./file');

class SummaryArticle extends Record({
    title:    '',
    depth:    0,
    path:     '',
    ref:      '',
    level:    '',
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


class SummaryState extends Record({
    file: new FileState(),
    parts: List()
}) {
    constructor(state = {}) {
        super({
            ...state,
            file:  new FileState(state.file),
            parts: (new List(state.parts))
                .map(article => new SummaryPart(article))
        });
    }

    static create(state) {
        return state instanceof SummaryState ?
            state : new SummaryState(state);
    }
}

module.exports = (state, action) => {
    return SummaryState.create(state);
};
