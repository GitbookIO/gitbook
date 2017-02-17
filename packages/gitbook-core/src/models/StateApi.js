const { Record } = require('immutable');

const DEFAULTS = {
    currentUser: null
};

/**
 * State for the API, it stores informations about the logged in user, etc.
 * @type {Record}
 */
class StateApi extends Record(DEFAULTS) {
    static create(state) {
        return state instanceof StateApi ?
            state : new StateApi(state);
    }

    /**
     * Check if reader is an user is loggedin.
     * @return {Boolean}
     */
    get isLoggedIn() {
        return Boolean(this.currentUser);
    }
}

module.exports = StateApi;
