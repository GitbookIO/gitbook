const { Record, List } = require('immutable');
const { createBrowserHistory, createMemoryHistory } = require('history');
const ACTION_TYPES = require('../actions/TYPES');

const isServerSide = (typeof window === 'undefined');

const NavigationState = Record({
    // Current location
    location:  null,
    // Are we loading a new page
    loading:   Boolean(false),
    // Did we fail loading a page?
    error:     null,
    // Listener for history changes
    listeners: List(),
    // Function to call to stop listening
    unlisten:  null,
    // History instance
    history:   null
});

function reduceNavigation(state, action) {
    state = state || NavigationState();
    switch (action.type) {

    case ACTION_TYPES.PAGE_FETCH_START:
        return state.merge({
            loading: true
        });

    case ACTION_TYPES.PAGE_FETCH_END:
        return state.merge({
            loading: false
        });

    case ACTION_TYPES.PAGE_FETCH_ERROR:
        return state.merge({
            loading: false,
            error:   action.error
        });

    case ACTION_TYPES.NAVIGATION_ACTIVATE:
        const history = isServerSide ? createMemoryHistory() : createBrowserHistory();
        const unlisten = history.listen(action.listener);

        // We can't use .merge since it convert history to an immutable
        const newState = state
            .set('history', history)
            .set('unlisten', unlisten);

        return newState;

    case ACTION_TYPES.NAVIGATION_DEACTIVATE:
        if (state.unlisten) {
            state.unlisten();
        }

        return state.merge({
            history:  null,
            unlisten: null
        });

    case ACTION_TYPES.NAVIGATION_UPDATE:
        return state.merge({
            location: action.location
        });

    case ACTION_TYPES.NAVIGATION_LISTEN:
        return state.merge({
            listeners: state.listeners.push(action.listener)
        });

    default:
        return state;

    }
}

module.exports = reduceNavigation;
