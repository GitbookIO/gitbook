const ACTION_TYPES = require('./TYPES');
const getPayload = require('../lib/getPayload');
const Location = require('../models/Location');

const SUPPORTED = (
    typeof window !== 'undefined' &&
    window.history && window.history.pushState && window.history.replaceState &&
    // pushState isn't reliable on iOS until 5.
    !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]\D|WebApps\/.+CFNetwork)/)
);

/**
 * Initialize the navigation
 */
function activate() {
    return (dispatch, getState) => {
        const listener = (location) => {
            const { listeners } = getState().navigation;
            location = Location.fromNative(location);

            listeners.forEach(handler => {
                handler(location, dispatch, getState);
            });
        };

        dispatch({ type: ACTION_TYPES.NAVIGATION_ACTIVATE, listener });
    };
}

/**
 * Cleanup the navigation
 */
function deactivate() {
    return { type: ACTION_TYPES.NAVIGATION_DEACTIVATE };
}

/**
 * Push a new url into the navigation
 * @param {String|Location} location
 * @return {Action} action
 */
function pushURI(location) {
    return (dispatch, getState) => {
        const { history } = getState().navigation;
        location = Location.fromNative(location);

        if (SUPPORTED) {
            history.push(location.toNative());
        } else {
            redirect(location.toString());
        }
    };
}

/**
 * Replace current state in navigation
 * @param {String|Location} location
 * @return {Action} action
 */
function replaceURI(location) {
    return (dispatch, getState) => {
        const { history } = getState().navigation;
        location = Location.fromNative(location);

        if (SUPPORTED) {
            history.replace(location.toNative());
        } else {
            redirect(location.toString());
        }
    };
}

/**
 * Hard redirection
 * @param {String} uri
 * @return {Action} action
 */
function redirect(uri) {
    return () => {
        window.location.href = uri;
    };
}

/**
 * Listen to url change
 * @param {Function} listener
 * @return {Action} action
 */
function listen(listener) {
    return { type: ACTION_TYPES.NAVIGATION_LISTEN, listener };
}

/**
 * Fetch a new page and update the store accordingly
 * @param {String} uri
 * @param {Boolean} options.replace
 * @return {Action} action
 */
function fetchPage(uri, options = {}) {
    const { replace } = options;

    return (dispatch, getState) => {
        const prevURI = location.href;
        dispatch({ type: ACTION_TYPES.PAGE_FETCH_START });

        if (replace) {
            dispatch(replaceURI(uri));
        } else {
            dispatch(pushURI(uri));
        }

        window.fetch(uri, {
            credentials: 'include'
        })
        .then(
            response => {
                return response.text();
            }
        )
        .then(
            html => {
                const payload = getPayload(html);

                if (!payload) {
                    throw new Error('No payload found in page');
                }

                dispatch({ type: ACTION_TYPES.PAGE_FETCH_END, payload });
            }
        )
        .catch(
            error => {
                dispatch(replaceURI(prevURI));
                dispatch(redirect(uri));

                dispatch({ type: ACTION_TYPES.PAGE_FETCH_ERROR, error });
            }
        );
    };
}

/**
 * Fetch a new article
 * @param {SummaryArticle} article
 * @return {Action} action
 */
function fetchArticle(article) {
    return fetchPage(article.path);
}

/**
 * Update anchor for current page
 * @param {String} hash
 * @return {Action} action
 */
function updateAnchor(hash) {
    return pushURI({ hash });
}

/**
 * Update query for current page
 * @param {Object|Map} query
 * @return {Action} action
 */
function updateQuery(query) {
    return pushURI({ query });
}

module.exports = {
    activate,
    deactivate,
    listen,
    pushURI,
    fetchPage,
    fetchArticle,
    updateAnchor,
    updateQuery
};
