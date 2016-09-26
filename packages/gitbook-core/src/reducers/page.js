const { Record } = require('immutable');
const ACTION_TYPES = require('../actions/TYPES');

const DEFAULTS = {
    title:    '',
    content:  '',
    dir:      'ltr',
    depth:    1,
    level:    '',
    previous: null
};

class PageState extends Record(DEFAULTS) {
    static create(state) {
        return state instanceof PageState ?
            state : new PageState({
                ...state
            });
    }
}

module.exports = (state, action) => {
    state = PageState.create(state);

    switch (action.type) {

    case ACTION_TYPES.PAGE_FETCH_END:
        return state.merge(action.payload.page);

    default:
        return state;

    }
};
