const { Record } = require('immutable');
const ActionTypes = require('../actions/types');

const SidebarState = Record({
    open: true
});

function reduceSidebar(state = SidebarState(), action) {
    switch (action.type) {
    case ActionTypes.TOGGLE_SIDEBAR:
        return state.set('open', !state.get('open'));
    default:
        return state;
    }
}

module.exports = reduceSidebar;
