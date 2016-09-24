const Redux = require('redux');
const ReduxThunk = require('redux-thunk').default;

const coreReducers = require('./reducers');
const composeReducer = require('./composeReducer');

/**
 * Create a new redux store from an initial state and a list of plugins.
 * Each plugin entry is the result of {createPlugin}.
 *
 * @param  {Array<Plugin>} plugins
 * @param  {Object} initialState
 * @return {ReduxStore} store
 */
function createStore(plugins, initialState) {
    const pluginReducers = plugins.map(plugin => plugin.onReduceState);
    const reducer = composeReducer(...[coreReducers].concat(pluginReducers));

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
        plugin.onInitialState(store.dispatch, store.getState);
    });

    return store;
}

module.exports = createStore;
