const lunr = require('lunr');
const GitBook = require('gitbook-core');
const { Record } = GitBook.Immutable;

const { TYPES } = require('./actions');

const LunrState = Record({
    idx: null,
    store: {}
});

module.exports = GitBook.createReducer('lunr', (state, action) => {
    state = state || LunrState();

    switch (action.type) {

    case TYPES.LOAD:
        return state
            .set('idx', lunr.Index.load(action.json.index))
            .merge({
                store: action.json.store
            });

    default:
        return state;
    }
});
