const { Record } = require('immutable');

const DEFAULTS = {
    init:   ((dispatch, getState) => {}),
    reduce: ((state, action) => state),
    actions: {}
};

class Plugin extends Record(DEFAULTS) {
    constructor(plugin) {
        super({
            init: plugin.init || DEFAULTS.init,
            reduce: plugin.reduce || DEFAULTS.reduce,
            actions: plugin.actions || DEFAULTS.actions
        });
    }
}

module.exports = Plugin;
