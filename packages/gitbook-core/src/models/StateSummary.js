const { Record, List } = require('immutable');

const File = require('../models/File');
const SummaryPart = require('../models/SummaryPart');

const DEFAULTS = {
    file: new File(),
    parts: List()
};

/**
 * State for the summary.
 * @type {Record}
 */
class StateSummary extends Record(DEFAULTS) {
    constructor(state = {}) {
        super({
            ...state,
            file:  new File(state.file),
            parts: (new List(state.parts))
                .map(article => new SummaryPart(article))
        });
    }

    static create(state) {
        return state instanceof StateSummary ?
            state : new StateSummary(state);
    }
}

module.exports = StateSummary;
