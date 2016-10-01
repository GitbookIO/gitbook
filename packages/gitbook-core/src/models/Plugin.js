const { Record } = require('immutable');

const DEFAULTS = {
    init:   ((dispatch, getState) => {}),
    reduce: ((state, action) => state),
    actions: {}
};

class Plugin extends Record(DEFAULTS) {

}

module.exports = Plugin;
