const Head = require('react-helmet');
const { Provider } = require('react-redux');

const { InjectedComponent, InjectedComponentSet } = require('./components/InjectedComponent');
const HTMLContent = require('./components/HTMLContent');

const { registerComponent } = require('./actions/components');
const ACTIONS = require('./actions/TYPES');

const Shapes = require('./shapes');
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
    // React Components
    InjectedComponent,
    InjectedComponentSet,
    HTMLContent,
    Head,
    Provider,
    // Utilities
    Shapes
};
