const copy = require('copy-to-clipboard');
const GitBook = require('gitbook-core');
const { React } = GitBook;

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

const CodeBlockWithCopy = React.createClass({
    propTypes: {
        children: React.PropTypes.node
    },

    onClick(event) {
        const { children } = this.props;

        event.preventDefault();
        event.stopPropagation();

        const text = getChildrenToText(children);
        copy(text);
    },

    render() {
        const { children } = this.props;

        return (
            <div className="CodeBlockWithCopy-Container">
                <GitBook.ImportCSS href="gitbook/copy-code/button.css" />

                {children}
                <span className="CodeBlockWithCopy-Button" onClick={this.onClick}>Copy</span>
            </div>
        );
    }
});

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Components }) => {
        dispatch(Components.registerComponent(CodeBlockWithCopy, { role: 'html:pre' }));
    }
});
