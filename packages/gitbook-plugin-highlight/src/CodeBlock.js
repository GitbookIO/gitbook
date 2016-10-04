const GitBook = require('gitbook-core');
const { React } = GitBook;

const CodeBlock = React.createClass({
    propTypes: {
        children: React.PropTypes.children
    },

    render() {
        const { children } = this.props;
        return <span />;
    }
});

module.exports = CodeBlock;
