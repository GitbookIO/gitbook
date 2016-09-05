const { InjectedComponent, InjectedComponentSet } = require('./components/InjectedComponent');
const { registerComponent } = require('./actions/components');
const ACTIONS = require('./actions/TYPES');
const connect = require('./connect');
const createPlugin = require('./createPlugin');
const createReducer = require('./createReducer');
const createStore = require('./createStore');

module.exports = {
    ACTIONS,
    connect,
    createPlugin,
    createReducer,
    createStore,
    registerComponent,
    InjectedComponent,
    InjectedComponentSet
};
