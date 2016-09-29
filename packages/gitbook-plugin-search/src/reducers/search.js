const GitBook = require('gitbook-core');
const { Record, List, OrderedMap } = GitBook.Immutable;

const TYPES = require('../actions/types');

const SearchState = Record({
    // Current query
    query:    String(''),
    // Current list of results
    results:  List(),
    // Search handlers
    handlers: OrderedMap()
});

module.exports = (state = SearchState(), action) => {
    switch (action.type) {

    case TYPES.CLEAR:
        return SearchState();

    case TYPES.UPDATE_QUERY:
        return state.merge({
            query: action.query
        });

    case TYPES.UPDATE_RESULTS:
        return state.merge({
            results: action.results
        });

    case TYPES.REGISTER_HANDLER:
        return state.merge({
            handlers: state.handlers.set(action.name, action.handler)
        });

    case TYPES.UNREGISTER_HANDLER:
        return state.merge({
            handlers: state.handlers.remove(action.name)
        });

    default:
        return state;
    }
};
