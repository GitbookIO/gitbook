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

        dispatch({
            type: ACTION_TYPES.NAVIGATION_ACTIVATE,
            listener: (location) => {
                location = Location.fromNative(location);
                const prevLocation = getState().navigation.location;

                // Fetch page if required
                if (!prevLocation || location.pathname !== prevLocation.pathname) {
                    dispatch(fetchPage(location.pathname));
                }

                // Signal location to listener
                dispatch(emit());

                // Update the location
                dispatch({
                    type: ACTION_TYPES.NAVIGATION_UPDATE,
                    location
                });
            }
        });

        // Trigger for existing listeners
        dispatch(emit());
    };
}

/**
 * Emit current location
 * @param {List|Array<Function>} to?
 */
function emit(to) {
    return (dispatch, getState) => {
        const { listeners, history } = getState().navigation;

        if (!history) {
            return;
        }

        const location = Location.fromNative(history.location);

        to = to || listeners;

        to.forEach(handler => {
            handler(location, dispatch, getState);
        });
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
function push(location) {
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
function replace(location) {
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
    return (dispatch, getState) => {
        dispatch({ type: ACTION_TYPES.NAVIGATION_LISTEN, listener });

        // Trigger for existing listeners
        dispatch(emit([ listener ]));
    };
}

/**
 * Fetch a new page and update the store accordingly
 * @param {String} pathname
 * @return {Action} action
 */
function fetchPage(pathname) {
    return (dispatch, getState) => {
        dispatch({ type: ACTION_TYPES.PAGE_FETCH_START });

        window.fetch(pathname, {
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
                // dispatch(redirect(pathname));
                console.error(error);
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

module.exports = {
    activate,
    deactivate,
    listen,
    push,
    replace,
    fetchPage,
    fetchArticle
};
