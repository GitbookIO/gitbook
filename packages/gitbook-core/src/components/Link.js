const React = require('react');
const ReactRedux = require('react-redux');

const File = require('../models/File');
const SummaryArticle = require('../models/SummaryArticle');
const SummaryArticleShape = require('../shapes/SummaryArticle');
const ContextShape = require('../shapes/Context');

const Link = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        href:     React.PropTypes.string,
        to:       React.PropTypes.oneOfType([
            React.PropTypes.string,
            SummaryArticleShape
        ])
    },

    contextTypes: {
        gitbook: ContextShape.isRequired
    },

    getHref() {
        const { gitbook } = this.context;
        let { to, href } = this.props;

        if (href) {
            return href;
        }

        if (SummaryArticle.is(to)) {
            return to.toURL(gitbook);
        }

        if (typeof to === 'string') {
            to = new File(to);
        }

        if (File.is(to)) {
            return to.toURL(gitbook);
        }

        throw new Error('Invalid format for prop "to"');
    },

    render() {
        const { children, ...props } = this.props;
        const href = this.getHref();
        return <a href={href} {...props}>{children}</a>;
    }
});

module.exports = ReactRedux.connect()(Link);
