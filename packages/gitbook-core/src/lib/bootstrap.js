const ReactDOM = require('react-dom');

const getPayload = require('./getPayload');
const createContext = require('./createContext');
const renderWithContext = require('./renderWithContext');

/**
 * Bootstrap GitBook on the browser (this function should not be called on the server side)
 */
function bootstrap() {
    const initialState = getPayload(window.document);
    const plugins = window.gitbookPlugins;

    const mountNode = document.getElementById('content');

    // Create the redux store
    const context = createContext(plugins, initialState);

    window.gitbookContext = context;

    // Render with the store
    const el = renderWithContext(context);

    ReactDOM.render(el, mountNode);
}


module.exports = bootstrap;
