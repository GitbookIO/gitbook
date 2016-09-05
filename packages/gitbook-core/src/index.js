const ACTIONS = require('./actions/TYPES');
const connect = require('./connect');
const createPlugin = require('./createPlugin');
const createReducer = require('./createReducer');
const createStore = require('./createStore');
const { InjectedComponent, InjectedComponentSet } = require('./components/InjectedComponent');

module.exports = {
    ACTIONS,
    connect,
    createPlugin,
    createReducer,
    createStore,
    InjectedComponent,
    InjectedComponentSet
};
