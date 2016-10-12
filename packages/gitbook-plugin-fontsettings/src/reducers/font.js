const GitBook = require('gitbook-core');
const { Record } = GitBook.Immutable;

const { TYPES } = require('../actions/font');

const FontState = Record({
    fontSize: 1
});

module.exports = (state = FontState(), action) => {
    switch (action.type) {

    case TYPES.RESET:
        return FontState();

    case TYPES.INCREASE:
        return state.merge({
            fontSize: state.fontSize + 1
        });

    case TYPES.DECREASE:
        return state.merge({
            fontSize: state.fontSize + 1
        });

    default:
        return state;
    }
};
