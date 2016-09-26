const React = require('react');
const ReactRedux = require('react-redux');
const path = require('path');
const url = require('url');
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

        // Article
        if (typeof to.ref === 'string') {
            const parts = url.parse(to.ref);
            const ext = path.extname(parts.pathname);
            const pathname = path.basename(parts.pathname, ext) + '.html';

            return pathname + (parts.hash || '');
        }
    },

    render() {
        const { children, ...props } = this.props;
        const href = this.getHref();
        return <a href={href} {...props}>{children}</a>;
    }
});

module.exports = ReactRedux.connect()(Link);
