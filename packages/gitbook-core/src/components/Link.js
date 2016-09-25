const React = require('react');
const SummaryArticleShape = require('../shapes/SummaryArticle');

const Link = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        href:     React.PropTypes.string,
        to:       React.PropTypes.oneOfType([
            React.PropTypes.string,
            SummaryArticleShape
        ])
    },

    getHref() {
        const { to, href } = this.props;

        if (href) {
            return href;
        }

        if (typeof to === 'string') {
            return to;
        }

        if (typeof to.ref === 'string') {
            // TODO: normalize url
            return to.ref;
        }
    },

    render() {
        const { children, ...props } = this.props;
        const href = this.getHref();
        return <a href={href} {...props}>{children}</a>;
    }
});

module.exports = Link;
