const ReactDOM = require('react-dom');

const getPayload = require('./lib/getPayload');
const createStore = require('./createStore');
const renderWithStore = require('./renderWithStore');

/**
 * Bootstrap GitBook on the browser (this function should not be called on the server side)
 */
function bootstrap() {
    const initialState = getPayload(window.document);
    const plugins = window.gitbookPlugins;

    console.log(initialState);

    const mountNode = document.getElementById('content');

    // Create the redux store
    const store = createStore(plugins, initialState);

    window.appStore = store;

    // Render with the store
    const el = renderWithStore(store);

    ReactDOM.render(el, mountNode);
}


module.exports = bootstrap;
