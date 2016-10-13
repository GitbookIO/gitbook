const ReactDOM = require('react-dom');

const getPayload = require('./getPayload');
const createContext = require('./createContext');
const renderWithContext = require('./renderWithContext');

/**
 * Bootstrap GitBook on the browser (this function should not be called on the server side).
 * @param {Object} matching
 */
function bootstrap(matching) {
    const initialState = getPayload(window.document);
    const plugins = window.gitbookPlugins;

    const mountNode = document.getElementById('content');

    // Create the redux store
    const context = createContext(plugins, initialState);

    window.gitbookContext = context;

    // Render with the store
    const el = renderWithContext(context, matching);

    ReactDOM.render(el, mountNode);
}


module.exports = bootstrap;
