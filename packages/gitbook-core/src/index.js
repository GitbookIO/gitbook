const React = require('react');
const Head = require('react-helmet');
const { Provider } = require('react-redux');
const { Flex, Box } = require('reflexbox');

const { InjectedComponent, InjectedComponentSet } = require('./components/InjectedComponent');
const { ImportLink, ImportScript, ImportCSS } = require('./components/Import');
const HTMLContent = require('./components/HTMLContent');
const Link = require('./components/Link');
const Icon = require('./components/Icon');
const Button = require('./components/Button');

const { registerComponent } = require('./actions/components');
const ACTIONS = require('./actions/TYPES');

const Shapes = require('./shapes');
const connect = require('./connect');
const createPlugin = require('./createPlugin');
const createReducer = require('./createReducer');
const createStore = require('./createStore');
const composeReducer = require('./composeReducer');
const bootstrap = require('./bootstrap');
const renderWithStore = require('./renderWithStore');

module.exports = {
    ACTIONS,
    bootstrap,
    renderWithStore,
    connect,
    createPlugin,
    createReducer,
    createStore,
    composeReducer,
    registerComponent,
    // React Components
    InjectedComponent,
    InjectedComponentSet,
    HTMLContent,
    Head,
    Provider,
    ImportLink,
    ImportScript,
    ImportCSS,
    FlexLayout: Flex,
    FlexBox: Box,
    Link,
    Icon,
    Button,
    React,
    // Utilities
    Shapes
};
