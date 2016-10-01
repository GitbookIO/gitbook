/* eslint-disable no-console */
const Redux = require('redux');
const ReduxThunk = require('redux-thunk').default;

const Plugin = require('./models/Plugin');
const Context = require('./models/Context');
const coreReducers = require('../reducers');
const composeReducer = require('./composeReducer');

const Components = require('./actions/components');
const I18n = require('./actions/i18n');
const Navigation = require('./actions/navigation');

const corePlugin = Plugin({
    reduce: coreReducers,
    actions: {
        Components, I18n, Navigation
    }
});

/**
 * Create a new context containing redux store from an initial state and a list of plugins.
 * Each plugin entry is the result of {createPlugin}.
 *
 * @param  {Array<Plugin>} plugins
 * @param  {Object} initialState
 * @return {Context} context
 */
function createContext(plugins, initialState) {
    plugins = [corePlugin].concat(plugins);

    // Compose the reducer from core with plugins
    const pluginReducers = plugins.map(plugin => plugin.reduce);
    const reducer = composeReducer(pluginReducers);

    // Get actions from all plugins
    const actions = plugins.reduce((accu, plugin) => {
        return Object.assign(accu, plugin.actions);
    }, {});

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
        plugin.init(store.dispatch, store.getState, actions);
    });

    return Context({
        store,
        actions
    });
}

module.exports = createContext;
