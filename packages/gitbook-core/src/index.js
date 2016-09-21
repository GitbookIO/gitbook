const Head = require('react-helmet');

const { InjectedComponent, InjectedComponentSet } = require('./components/InjectedComponent');
const HTMLContent = require('./components/HTMLContent');

const { registerComponent } = require('./actions/components');
const ACTIONS = require('./actions/TYPES');

const Shapes = require('./shapes');
const connect = require('./connect');
const createPlugin = require('./createPlugin');
const createReducer = require('./createReducer');
const createStore = require('./createStore');
const renderComponent = require('./renderComponent');

module.exports = {
    ACTIONS,
    connect,
    createPlugin,
    createReducer,
    createStore,
    renderComponent,
    registerComponent,
    // React Components
    InjectedComponent,
    InjectedComponentSet,
    HTMLContent,
    Head,
    // Utilities
    Shapes
};
