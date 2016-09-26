const React = require('react');
const ReactDOMServer = require('react-dom/server');
const GitBook = require('gitbook-core');

const loadPlugins = require('./loadPlugins');

const BOOTSTRAP_CODE = '(function() { require("gitbook-core").bootstrap() })()';

function HTML({head, innerHTML, payload, scripts}) {
    const attrs = head.htmlAttributes.toComponent();

    return (
        <html {...attrs}>
            <head>
                {head.title.toComponent()}
                {head.meta.toComponent()}
                {head.link.toComponent()}
                {head.style.toComponent()}
            </head>
            <body>
                <div id="content" dangerouslySetInnerHTML={{__html: innerHTML}} />
                {scripts.map(script => {
                    return <script key={script} src={script} />;
                })}
                <script type="application/payload+json" dangerouslySetInnerHTML={{__html: payload}} />
                <script type="application/javascript" dangerouslySetInnerHTML={{__html: BOOTSTRAP_CODE}} />
                {head.script.toComponent()}
            </body>
        </html>
    );
}
HTML.propTypes = {
    head:      React.PropTypes.object,
    innerHTML: React.PropTypes.string,
    payload:   React.PropTypes.string,
    scripts:   React.PropTypes.arrayOf(React.PropTypes.string)
};

/**
 * Render a page
 * @param  {OrderedMap<String:Plugin>} plugin
 * @param  {Object} initialState
 * @return {String} html
 */
function render(plugins, initialState) {
    // Load the plugins
    const browserPlugins = loadPlugins(plugins);
    const payload = JSON.stringify(initialState);
    const store = GitBook.createStore(browserPlugins, initialState);

    const scripts = plugins.toList()
        .filter(plugin => plugin.getPackage().has('browser'))
        .map(plugin => 'gitbook/plugins/' + plugin.getName() + '.js')
        .toArray();

    const el = GitBook.renderWithStore(store);

    // Render inner body
    const innerHTML = ReactDOMServer.renderToString(el);

    // Get headers
    const head = GitBook.Head.rewind();

    // Render whole HTML page
    const htmlEl = <HTML
        head={head}
        innerHTML={innerHTML}
        payload={payload}
        scripts={['gitbook/core.js'].concat(scripts)}
    />;

    const html = ReactDOMServer.renderToStaticMarkup(htmlEl);
    return html;
}

module.exports = render;
