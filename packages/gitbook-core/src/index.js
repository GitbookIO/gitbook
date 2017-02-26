require('whatwg-fetch');

const React = require('react');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const Immutable = require('immutable');
const Head = require('react-helmet');
const Promise = require('bluebird');
const { Provider } = require('react-redux');
const { Flex, Box } = require('reflexbox');

const { InjectedComponent, InjectedComponentSet } = require('./components/InjectedComponent');
const { ImportLink, ImportScript, ImportCSS } = require('./components/Import');
const PageContent = require('./components/PageContent');
const Link = require('./components/Link');
const Image = require('./components/Image');
const Icon = require('./components/Icon');
const HotKeys = require('./components/HotKeys');
const Button = require('./components/Button');
const ButtonGroup = require('./components/ButtonGroup');
const Dropdown = require('./components/Dropdown');
const Panel = require('./components/Panel');
const Backdrop = require('./components/Backdrop');
const Tooltipped = require('./components/Tooltipped');
const I18nProvider = require('./components/I18nProvider');

const ACTIONS = require('./actions/TYPES');

const PropTypes = require('./propTypes');
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
    // React Components
    I18nProvider,
    InjectedComponent,
    InjectedComponentSet,
    PageContent,
    Head,
    Panel,
    Provider,
    ImportLink,
    ImportScript,
    ImportCSS,
    FlexLayout: Flex,
    FlexBox: Box,
    Link,
    Image,
    Icon,
    HotKeys,
    Button,
    ButtonGroup,
    Dropdown,
    Backdrop,
    Tooltipped,
    // Utilities
    PropTypes,
    // Librairies
    React,
    ReactCSSTransitionGroup,
    Immutable,
    Promise
};
