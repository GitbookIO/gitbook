const { fromJS } = require('immutable');
const ACTION_TYPES = require('../actions/TYPES');

module.exports = (state, action) => {
    state = fromJS(state);
    switch (action.type) {

    case ACTION_TYPES.PAGE_FETCH_END:
        return fromJS(action.payload.config);

    default:
        return state;

    }
};
