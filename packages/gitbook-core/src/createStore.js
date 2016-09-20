const Redux = require('redux');
const ReduxThunk = require('redux-thunk').default;

const coreReducers = require('./reducers');

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
    const store = Redux.createStore(
        (state, action) => {
            return pluginReducers.reduce(
                (newState, reducer) => reducer(newState, action),
                coreReducers(state, action)
            );
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
