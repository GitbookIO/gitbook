const ReactDOMServer = require('gitbook-core/lib/server');
const GitBook = require('gitbook-core');
const { React } = GitBook;

const timing = require('../utils/timing');
const loadPlugins = require('./loadPlugins');

function HTML({head, innerHTML, payload, scripts, bootstrap}) {
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
                {scripts.map((script) => {
                    return <script key={script} src={script} />;
                })}
                <script type="application/payload+json" dangerouslySetInnerHTML={{__html: payload}} />
                <script type="application/javascript" dangerouslySetInnerHTML={{__html: bootstrap}} />
                {head.script.toComponent()}
            </body>
        </html>
    );
}
HTML.propTypes = {
    head:      React.PropTypes.object,
    innerHTML: React.PropTypes.string,
    payload:   React.PropTypes.string,
    bootstrap: React.PropTypes.string,
    scripts:   React.PropTypes.arrayOf(React.PropTypes.string)
};

/**
 * Get bootstrap code for a role
 * @param  {String} role
 * @return {String}
 */
function getBootstrapCode(role) {
    return `(function() { require("gitbook-core").bootstrap({ role: "${role}" }) })()`;
}

/**
 * Render a view using plugins.
 *
 * @param  {OrderedMap<String:Plugin>} plugin
 * @param  {Object} initialState
 * @param  {String} type ("ebook" or "browser")
 * @param  {String} role
 * @return {String} html
 */
function render(plugins, initialState, type, role) {
    return timing.measure(
        'browser.render',
        () => {
            // Load the plugins
            const browserPlugins = loadPlugins(plugins, type);
            const payload = JSON.stringify(initialState);
            const context = GitBook.createContext(browserPlugins, initialState);

            const currentFile = context.getState().file;

            const scripts = plugins.toList()
                .filter(plugin => plugin.getPackage().has(type))
                .map((plugin) => {
                    return currentFile.relative('gitbook/plugins/' + plugin.getName() + '.js');
                })
                .toArray();

            const el = GitBook.renderWithContext(context, { role });

            // We're done with the context
            context.deactivate();

            // Render inner body
            const innerHTML = ReactDOMServer.renderToString(el);

            // Get headers
            const head = GitBook.Head.rewind();

            // Render whole HTML page
            const htmlEl = <HTML
                head={head}
                innerHTML={innerHTML}
                payload={payload}
                bootstrap={getBootstrapCode(role)}
                scripts={[
                    currentFile.relative('gitbook/core.js')
                ].concat(scripts)}
            />;

            const html = ReactDOMServer.renderToStaticMarkup(htmlEl);
            return html;
        }
    );
}

module.exports = render;
