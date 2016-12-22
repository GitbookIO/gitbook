const { Record, List } = require('immutable');

const DEFAULTS = {
    store: null,
    actions: {},
    plugins: List()
};

class Context extends Record(DEFAULTS) {
    constructor(...args) {
        super(...args);

        this.dispatch = this.dispatch.bind(this);
        this.getState = this.getState.bind(this);
    }

    /**
     * Return current state
     * @return {Object}
     */
    getState() {
        const { store } = this;
        return store.getState();
    }

    /**
     * Dispatch an action
     * @param {Action} action
     */
    dispatch(action) {
        const { store } = this;
        return store.dispatch(action);
    }

    /**
     * Deactivate the context, cleanup resources from plugins.
     */
    deactivate() {
        const { plugins, actions } = this;

        plugins.forEach(plugin => {
            plugin.deactivate(this.dispatch, this.getState, actions);
        });
    }

    /**
     * Activate the context and the plugins.
     */
    activate() {
        const { plugins, actions } = this;

        plugins.forEach(plugin => {
            plugin.activate(this.dispatch, this.getState, actions);
        });
    }
}

module.exports = Context;
