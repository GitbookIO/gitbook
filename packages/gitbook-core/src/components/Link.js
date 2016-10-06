const React = require('react');
const ReactRedux = require('react-redux');

const File = require('../models/File');
const SummaryArticle = require('../models/SummaryArticle');
const SummaryArticleShape = require('../shapes/SummaryArticle');
const FileShape = require('../shapes/File');

const Link = React.createClass({
    propTypes: {
        currentFile: FileShape,
        children:    React.PropTypes.node,

        // Destination of the link
        to: React.PropTypes.oneOfType([
            React.PropTypes.string,
            SummaryArticleShape,
            FileShape
        ])
    },

    getHref() {
        let { currentFile, to } = this.props;

        if (SummaryArticle.is(to) || File.is(to)) {
            to = to.url;
        }

        return currentFile.relative(to);
    },

    render() {
        const { children, ...props } = this.props;
        const href = this.getHref();
        return <a href={href} {...props}>{children}</a>;
    }
});

module.exports = ReactRedux.connect(state => {
    return { currentFile: state.file };
})(Link);
