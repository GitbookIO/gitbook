const ACTION_TYPES = require('./TYPES');
const getPayload = require('../lib/getPayload');

const SUPPORTED = (
    typeof window !== 'undefined' &&
    window.history && window.history.pushState && window.history.replaceState &&
    // pushState isn't reliable on iOS until 5.
    !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]\D|WebApps\/.+CFNetwork)/)
);

let PUSH_ID = 0;

/**
 * Generate a new state to be pushed or replaced
 * @param {Object}
 */
function genState() {
    return {
        id: (PUSH_ID++)
    };
}

/**
 * Push a new url into the navigation
 * @param {String} uri
 * @return {Action} action
 */
function pushURI(uri) {
    return () => {
        const state = genState();

        if (SUPPORTED) {
            window.history.pushState(state, '', uri);
        } else {
            redirect(uri);
        }
    };
}

/**
 * Replace current state in navigation
 * @param {String} uri
 * @return {Action} action
 */
function replaceURI(uri) {
    return () => {
        const state = genState();

        if (SUPPORTED) {
            window.history.replaceState(state, '', uri);
        } else {
            redirect(uri);
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
 * @param {String} anchor
 * @return {Action} action
 */
function updateAnchor(anchor) {
    return { type: ACTION_TYPES.PAGE_UPDATE_ANCHOR, anchor };
}

/**
 * Update query for current page
 * @param {Object|Map} query
 * @return {Action} action
 */
function updateQuery(query) {
    return { type: ACTION_TYPES.PAGE_UPDATE_QUERY, query };
}

module.exports = {
    pushURI,
    fetchPage,
    fetchArticle,
    updateAnchor,
    updateQuery
};
