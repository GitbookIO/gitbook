const { Record, Map } = require('immutable');
const ACTION_TYPES = require('../actions/TYPES');

const NavigationState = Record({
    // Are we loading a new page
    loading: Boolean(false),
    // Did we fail loading a page?
    error:   null,
    // Query string
    query:   Map(),
    // Current anchor
    anchor:  String('')
});

function reduceNavigation(state, action) {
    state = state || NavigationState();
    switch (action.type) {

    case ACTION_TYPES.PAGE_FETCH_START:
        return state.merge({
            loading: true
        });

    case ACTION_TYPES.PAGE_FETCH_END:
        return state.merge({
            loading: false
        });

    case ACTION_TYPES.PAGE_FETCH_ERROR:
        return state.merge({
            loading: false,
            error:   action.error
        });

    case ACTION_TYPES.PAGE_UPDATE_ANCHOR:
        return state.merge({
            anchor: action.anchor
        });

    default:
        return state;

    }
}

module.exports = reduceNavigation;
