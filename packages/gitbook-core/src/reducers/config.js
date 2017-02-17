const ACTION_TYPES = require('../actions/TYPES');
const Config = require('../models/Config');

module.exports = (state, action) => {
    state = Config.create(state);

    switch (action.type) {

    case ACTION_TYPES.PAGE_FETCH_END:
        return Config.create(action.payload.config);

    default:
        return state;

    }
};
