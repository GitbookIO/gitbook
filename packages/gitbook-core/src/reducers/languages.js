const Languages = require('../models/Languages');

module.exports = (state, action) => {
    state = Languages.create(state);

    switch (action.type) {

    default:
        return state;

    }
};
