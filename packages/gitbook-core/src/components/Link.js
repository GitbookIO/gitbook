const React = require('react');
const ReactRedux = require('react-redux');

const File = require('../models/File');
const SummaryArticle = require('../models/SummaryArticle');
const SummaryArticleShape = require('../propTypes/SummaryArticle');
const FileShape = require('../propTypes/File');

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

    render() {
        const { currentFile, to, children, ...props } = this.props;
        let href = to;

        if (SummaryArticle.is(to) || File.is(to)) {
            href = to.url;
        }

        href = currentFile.relative(href);
        return <a href={href} {...props}>{children}</a>;
    }
});

module.exports = ReactRedux.connect(state => {
    return { currentFile: state.file };
})(Link);
