/* eslint-disable no-console */
const { Record } = require('immutable');
const Redux = require('redux');
const ReduxThunk = require('redux-thunk').default;

const coreReducers = require('../reducers');
const composeReducer = require('./composeReducer');

const GitBookContext = Record({
    store: null,
    actions: {}
}, 'GitBookContext');

/**
 * Create a new context containing redux store from an initial state and a list of plugins.
 * Each plugin entry is the result of {createPlugin}.
 *
 * @param  {Array<Plugin>} plugins
 * @param  {Object} initialState
 * @return {GitBookContext} context
 */
function createContext(plugins, initialState) {
    // Compose the reducer from core with plugins
    const pluginReducers = plugins.map(plugin => plugin.reduce);
    const reducer = composeReducer(...[coreReducers].concat(pluginReducers));

    // Get actions from all plugins
    const actions = plugins.reduce((accu, plugin) => {
        return { ...accu, ...plugin.actions };
    });

    const store = Redux.createStore(
        (state, action) => {
            console.log('[store]', action.type);
            return reducer(state, action);
        },
        initialState,
        Redux.compose(Redux.applyMiddleware(ReduxThunk))
    );

    // Initialize the plugins
    plugins.forEach(plugin => {
        plugin.init(store.dispatch, store.getState);
    });

    return GitBookContext({
        store,
        actions
    });
}

module.exports = createContext;
