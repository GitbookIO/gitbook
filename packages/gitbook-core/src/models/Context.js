const { Record } = require('immutable');

const DEFAULTS = {
    store: null,
    actions: {}
};

class Context extends Record(DEFAULTS) {

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
}

module.exports = Context;
