const hljs = require('highlight.js');
const GitBook = require('gitbook-core');
const { React } = GitBook;

const getLanguage = require('./getLanguage');

/**
 * Get children as text
 * @param {React.Children} children
 * @return {String}
 */
function getChildrenToText(children) {
    return React.Children.map(children, child => {
        if (typeof child === 'string') {
            return child;
        } else {
            return child.props.children ?
                getChildrenToText(child.props.children) : '';
        }
    }).join('');
}

const CodeBlock = React.createClass({
    propTypes: {
        children:  React.PropTypes.node,
        className: React.PropTypes.string
    },

    render() {
        const { children, className } = this.props;
        const content = getChildrenToText(children);
        const lang = getLanguage(className || '');

        const includeCSS = <GitBook.ImportCSS href="gitbook/highlight/white.css" />;

        try {
            const html = hljs.highlight(lang, content).value;
            return (
                <code>
                    {includeCSS}
                    <span dangerouslySetInnerHTML={{__html: html}} />
                </code>
            );
        } catch (e) {
            return (
                <code>
                    {includeCSS}
                    {content}
                </code>
            );
        }
    }
});

module.exports = CodeBlock;
