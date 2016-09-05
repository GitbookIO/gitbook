const { List } = require('immutable');
const ACTION_TYPES = require('../actions/TYPES');

function reduceComponents(state, action) {
    state = state || List();

    switch (action.type) {

    case ACTION_TYPES.REGISTER_COMPONENT:
        return state.push({
            Component: action.Component,
            descriptor: action.descriptor
        });

    default:
        return state;

    }
}

module.exports = reduceComponents;
