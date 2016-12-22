const { Record, List } = require('immutable');

const File = require('../models/File');
const SummaryPart = require('../models/SummaryPart');


class SummaryState extends Record({
    file: new File(),
    parts: List()
}) {
    constructor(state = {}) {
        super({
            ...state,
            file:  new File(state.file),
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
