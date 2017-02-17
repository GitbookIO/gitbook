const { Record } = require('immutable');

const DEFAULTS = {
    // Is the API accessible for this book ? (Is the book on GitBook.com)
    isAvailable: false,
    // Current gitbook.com ready the book
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
