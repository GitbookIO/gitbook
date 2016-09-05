const ACTIONS = require('./actions/TYPES');
const connect = require('./connect');
const InjectedComponent = require('./InjectedComponent');
const InjectedComponentSet = require('./InjectedComponentSet');
const createPlugin = require('./createPlugin');
const createReducer = require('./createReducer');
const createStore = require('./createStore');

module.exports = {
    ACTIONS,
    connect,
    createPlugin,
    createReducer,
    createStore,
    InjectedComponent,
    InjectedComponentSet
};
