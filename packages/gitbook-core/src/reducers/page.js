const ACTION_TYPES = require('../actions/TYPES');
const Page = require('../models/Page');

module.exports = (state, action) => {
    state = Page.create(state);

    switch (action.type) {

    case ACTION_TYPES.PAGE_FETCH_END:
        return state.merge(action.payload.page);

    default:
        return state;

    }
};
