const copy = require('copy-to-clipboard');
const GitBook = require('gitbook-core');
const { React } = GitBook;

const COPIED_TIMEOUT = 1000;

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

let CodeBlockWithCopy = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        i18n: GitBook.PropTypes.I18n
    },

    getInitialState() {
        return {
            copied: false
        };
    },

    onClick(event) {
        const { children } = this.props;

        event.preventDefault();
        event.stopPropagation();

        const text = getChildrenToText(children);
        copy(text);

        this.setState({ copied: true }, () => {
            this.timeout = setTimeout(() => {
                this.setState({
                    copied: false
                });
            }, COPIED_TIMEOUT);
        });
    },

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    },

    render() {
        const { children, i18n } = this.props;
        const { copied } = this.state;

        return (
            <div className="CodeBlockWithCopy-Container">
                <GitBook.ImportCSS href="gitbook/copy-code/button.css" />

                {children}
                <span className="CodeBlockWithCopy-Button" onClick={this.onClick}>
                    {copied ? i18n.t('COPIED') : i18n.t('COPY')}
                </span>
            </div>
        );
    }
});

CodeBlockWithCopy = GitBook.connect(CodeBlockWithCopy);

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Components }) => {
        dispatch(Components.registerComponent(CodeBlockWithCopy, { role: 'html:pre' }));
    }
});
