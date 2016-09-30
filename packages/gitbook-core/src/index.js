require('whatwg-fetch');

const React = require('react');
const Immutable = require('immutable');
const Head = require('react-helmet');
const Promise = require('bluebird');
const { Provider } = require('react-redux');
const { Flex, Box } = require('reflexbox');

const { InjectedComponent, InjectedComponentSet } = require('./components/InjectedComponent');
const { ImportLink, ImportScript, ImportCSS } = require('./components/Import');
const HTMLContent = require('./components/HTMLContent');
const Link = require('./components/Link');
const Icon = require('./components/Icon');
const Button = require('./components/Button');
const I18nProvider = require('./components/I18nProvider');

const { registerComponent } = require('./actions/components');
const ACTIONS = require('./actions/TYPES');

const Shapes = require('./shapes');
const connect = require('./lib/connect');
const createPlugin = require('./lib/createPlugin');
const createReducer = require('./lib/createReducer');
const createContext = require('./lib/createContext');
const composeReducer = require('./lib/composeReducer');
const bootstrap = require('./lib/bootstrap');
const renderWithContext = require('./lib/renderWithContext');

module.exports = {
    ACTIONS,
    bootstrap,
    renderWithContext,
    connect,
    createPlugin,
    createReducer,
    createContext,
    composeReducer,
    registerComponent,
    // React Components
    I18nProvider,
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
    // Utilities
    Shapes,
    // Librairies
    React,
    Immutable,
    Promise
};
