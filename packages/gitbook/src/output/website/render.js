const React = require('react');
const ReactDOMServer = require('react-dom/server');
const GitBook = require('gitbook-core');

function HTML({head, innerHTML}) {
    const attrs = head.htmlAttributes.toComponent();

    return (
        <html {...attrs}>
            <head>
                {head.title.toComponent()}
                {head.meta.toComponent()}
                {head.link.toComponent()}
            </head>
            <body>
                <div id="content" dangerouslySetInnerHTML={{__html: innerHTML}} />
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
 * @param  {Object} initialState
 * @return {String} html
 */
function render(initialState) {
    const plugins = [];
    const store = GitBook.createStore(plugins, initialState);
    const { el, head } = GitBook.renderComponent(store, {
        role: 'Body'
    });

    const innerHTML = ReactDOMServer.renderToString(el);
    const htmlEl = <HTML head={head} innerHTML={innerHTML} />;

    const html = ReactDOMServer.renderToStaticMarkup(htmlEl);
    return html;
}

module.exports = render;
