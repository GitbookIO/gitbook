const { Promise, Immutable } = require('gitbook-core');
const { List } = Immutable;

const TYPES = require('./types');
const Result = require('../models/Result');

/*
    Search workflow:

    1. Typing in the search input
    2. Trigger an update of the url
    3. An update of the url, trigger an update of search results
 */

/**
 * Start a search query
 * @param {String} q
 * @return {Action}
 */
function query(q) {
    return (dispatch, getState, { Navigation }) => {
        const searchState = getState().search;
        const currentQuery = searchState.query;

        const queryString = q ? { q } : {};

        if (currentQuery && q) {
            dispatch(Navigation.replace({ query: queryString }));
        } else {
            dispatch(Navigation.push({ query: queryString }));
        }
    };
}

/**
 * Update results for a query
 * @param {String} q
 * @return {Action}
 */
function handleQuery(q) {
    if (!q) {
        return clear();
    }

    return (dispatch, getState, actions) => {
        const { handlers } = getState().search;

        dispatch({ type: TYPES.START, query: q });

        return Promise.reduce(
            handlers.toArray(),
            (results, handler) => {
                return Promise.resolve(handler(q, dispatch, getState, actions))
                .then(handlerResults => {
                    return handlerResults.map(result => new Result(result));
                })
                .then(handlerResults => results.concat(handlerResults));
            },
            List()
        )
        .then(
            results => {
                dispatch({ type: TYPES.END, query: q, results });
            }
        );
    };
}

/**
 * Refresh current search (when handlers have changed)
 * @return {Action}
 */
function refresh() {
    return (dispatch, getState) => {
        const q = getState().search.query;
        console.log('refresh search with', q);
        if (q) {
            dispatch(handleQuery(q));
        }
    };
}

/**
 * Clear the whole search
 * @return {Action}
 */
function clear() {
    return { type: TYPES.CLEAR };
}

/**
 * Register a search handler
 * @param {String} name
 * @param {Function} handler
 * @return {Action}
 */
function registerHandler(name, handler) {
    return (dispatch) => {
        dispatch({ type: TYPES.REGISTER_HANDLER, name, handler });
        dispatch(refresh());
    };
}

/**
 * Unregister a search handler
 * @param {String} name
 * @return {Action}
 */
function unregisterHandler(name) {
    return (dispatch) => {
        dispatch({ type: TYPES.UNREGISTER_HANDLER, name });
        dispatch(refresh());
    };
}

module.exports = {
    clear,
    query,
    handleQuery,
    registerHandler,
    unregisterHandler
};
