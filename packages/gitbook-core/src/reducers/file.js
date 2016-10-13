const ACTION_TYPES = require('../actions/TYPES');
const File = require('../models/File');

module.exports = (state, action) => {
    state = File.create(state);

    switch (action.type) {

    case ACTION_TYPES.PAGE_FETCH_END:
        return state.merge(action.payload.file);

    default:
        return state;

    }
};
