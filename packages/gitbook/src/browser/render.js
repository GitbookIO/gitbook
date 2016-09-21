const React = require('react');
const ReactDOMServer = require('react-dom/server');
const GitBook = require('gitbook-core');

function HTML({head, innerHTML, props}) {
    const attrs = head.htmlAttributes.toComponent();
    const propsJSON = JSON.stringify(props);

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
                <script
                    type="application/payload+json"
                    dangerouslySetInnerHTML={{__html: propsJSON}} />
            </body>
        </html>
    );
}
HTML.propTypes = {
    head:      React.PropTypes.object,
    props:     React.PropTypes.object,
    innerHTML: React.PropTypes.string
};

/**
 * Render a page
 * @param  {List<Plugin>} plugin
 * @param  {Object} initialState
 * @return {String} html
 */
function render(plugins, initialState) {
    const store = GitBook.createStore(plugins, initialState);
    const { el, getHead } = GitBook.renderComponent(store, { role: 'Body' });

    // Render inner body
    const innerHTML = ReactDOMServer.renderToString(el);

    // Get headers
    const head = getHead();

    // Render whole HTML page
    const htmlEl = <HTML
        head={head}
        innerHTML={innerHTML}
        props={initialState}
    />;

    const html = ReactDOMServer.renderToStaticMarkup(htmlEl);
    return html;
}

module.exports = render;
