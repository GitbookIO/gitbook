const GitBook = require('gitbook-core');
const { Record, List, OrderedMap } = GitBook.Immutable;

const TYPES = require('../actions/types');

const SearchState = Record({
    // Is the search being processed
    loading:  Boolean(false),
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
        return state.merge({
            loading: false,
            query:   '',
            results: List()
        });

    case TYPES.START:
        return state.merge({
            loading: true,
            query:   action.query
        });

    case TYPES.END:
        if (action.query !== state.query) {
            return state;
        }

        return state.merge({
            loading: false,
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
