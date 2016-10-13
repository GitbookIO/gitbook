const GitBook = require('gitbook-core');
const { React } = GitBook;

const siteShape = require('../shapes/site');

// An individual site sharing button
const SiteButton = React.createClass({
    propTypes: {
        site: siteShape.isRequired,
        onShare: React.PropTypes.func.isRequired
    },

    onClick(e) {
        e.preventDefault();
        this.props.onShare(this.props.site);
    },

    render() {
        const { site } = this.props;

        return (
            <GitBook.Button onClick={this.onClick}>
                <GitBook.Icon id={site.icon}/>
            </GitBook.Button>
        );
    }
});

module.exports = SiteButton;
