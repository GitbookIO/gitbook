const GitBookAPI = require('gitbook-api');
const ACTION_TYPES = require('./TYPES');

const User = require('../models/User');

/**
 * Execute an HTTP API request.
 *
 * @param {String} method
 * @param {String} url
 * @param {Object} params
 * @param {Object} data
 * @return {Action}
 */
function request(method, url, params, data) {
    return (dispatch, getState) => {
        const client = new GitBookAPI({}, {
            host: '<todo>'
        });

        return client.request(url, {
            method,
            data,
            params
        });
    };
}

const get  = (...args) => request('GET', ...args);
const post = (...args) => request('POST', ...args);
const del  = (...args) => request('DELETE', ...args);

/**
 * Fetch infos about current user.
 * @return {Action}
 */
function fetchCurrentUser() {
    return (dispatch) => {
        return dispatch(get('reader'))
        .then((user) => {
            dispatch({
                type: ACTION_TYPES.API_USER_FETCHED,
                user: new User(user)
            });
        });
    };
}

/**
 * Activate the API:
 *  - Fetch the current user.
 * @return {Action}
 */
function activate() {
    return (dispatch) => {
        return dispatch(fetchCurrentUser());
    };
}

/**
 * Deactivate the AP
 * @return {Action}
 */
function deactivate() {
    return (dispatch) => {

    };
}

module.exports = {
    get, post, del,
    activate, deactivate
};
