const { Record } = require('immutable');

const DEFAULTS = {
    username: ''
};

/**
 * An instance of a GitBook.com user (from API)
 * @type {String}
 */
class User extends Record(DEFAULTS) {

}

module.exports = User;
