const React = require('react');
const ReactDOMServer = require('react-dom/server');
const GitBook = require('gitbook-core');

const loadPlugins = require('./loadPlugins');

function HTML({head, innerHTML}) {
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
                {head.script.toComponent()}
            </body>
        </html>
    );
}
HTML.propTypes = {
    head:      React.PropTypes.object,
    innerHTML: React.PropTypes.string
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
    const store = GitBook.createStore(browserPlugins, initialState);

    const scripts = plugins.toList()
        .filter(plugin => plugin.getPackage().has('browser'))
        .map(plugin => {
            return { src: '/gitbook/plugins/' + plugin.getName() + '.js' };
        })
        .toArray();

    scripts.push({
        type: 'application/payload+json',
        innerHTML: JSON.stringify(initialState)
    });

    const el = (
        <GitBook.Provider store={store}>
            <GitBook.InjectedComponent matching={{ role: 'Body' }}>
                <GitBook.Head
                    script={scripts}
                />
            </GitBook.InjectedComponent>
        </GitBook.Provider>
    );

    // Render inner body
    const innerHTML = ReactDOMServer.renderToString(el);

    // Get headers
    const head = GitBook.Head.rewind();

    // Render whole HTML page
    const htmlEl = <HTML
        head={head}
        innerHTML={innerHTML}
    />;

    const html = ReactDOMServer.renderToStaticMarkup(htmlEl);
    return html;
}

module.exports = render;
