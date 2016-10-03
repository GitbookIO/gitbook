const { Record } = require('immutable');

const DEFAULTS = {
    activate:   ((dispatch, getState) => {}),
    deactivate: ((dispatch, getState) => {}),
    reduce:     ((state, action) => state),
    actions:    {}
};

class Plugin extends Record(DEFAULTS) {
    constructor(plugin) {
        super({
            activate:   plugin.activate || DEFAULTS.activate,
            deactivate: plugin.deactivate || DEFAULTS.deactivate,
            reduce:     plugin.reduce || DEFAULTS.reduce,
            actions:    plugin.actions || DEFAULTS.actions
        });
    }
}

module.exports = Plugin;
