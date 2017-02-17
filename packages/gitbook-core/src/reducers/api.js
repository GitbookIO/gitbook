const StateApi = require('../models/StateApi');
const ACTION_TYPES = require('../actions/TYPES');

module.exports = (state, action) => {
    state =  StateApi.create(state);

    switch (action.type) {
    case ACTION_TYPES.API_USER_FETCHED:
        return state.merge({
            currentUser: action.user
        });
    default:
        return state;
    }
};
