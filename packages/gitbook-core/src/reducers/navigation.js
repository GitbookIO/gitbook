const { Record } = require('immutable');
const ACTION_TYPES = require('../actions/TYPES');

const NavigationState = Record({
    loading: false,
    error:   null
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

    default:
        return state;

    }
}

module.exports = reduceNavigation;
