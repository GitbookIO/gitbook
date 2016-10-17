const GitBook = require('gitbook-core');
const { React } = GitBook;

const SITES = require('../SITES');
const optionsShape = require('../shapes/options');
const SiteButton = require('./SiteButton');
const ShareButton = require('./ShareButton');

/**
 * Displays the group of sharing buttons
 */
const SharingButtons = React.createClass({
    propTypes: {
        options: optionsShape.isRequired,
        page: GitBook.PropTypes.Page.isRequired
    },

    onShare(site) {
        site.onShare(location.href, this.props.page.title);
    },

    render() {
        const { options } = this.props;

        // Highlighted sites
        const mainButtons = SITES
            .ALL
            .filter(id => options[id])
            .map(id => <SiteButton key={id} onShare={this.onShare} site={SITES[id]} />);

        // Other sites
        let shareButton = undefined;
        if (options.all.length > 0) {
            shareButton = (
                <ShareButton siteIds={options.all}
                             onShare={this.onShare} />
            );
        }

        return (
            <GitBook.ButtonGroup>
                { mainButtons }
                { shareButton }
            </GitBook.ButtonGroup>
        );
    }
});

function mapStateToProps(state) {
    let options = state.config.getIn(['pluginsConfig', 'sharing']);
    if (options) {
        options = options.toJS();
    } else {
        options = { all: [] };
    }

    return {
        page: state.page,
        options
    };
}

module.exports = GitBook.connect(SharingButtons, mapStateToProps);
