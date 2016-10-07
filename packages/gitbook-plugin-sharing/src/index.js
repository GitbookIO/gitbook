const GitBook = require('gitbook-core');
const { React } = GitBook;
const { string, arrayOf, shape, func } = React.PropTypes;

const SITES = require('./SITES');
const optionsShape = require('./optionsShape');
const siteShape = shape({
    label: string.isRequired,
    icon: string.isRequired,
    onShare: func.isRequired
});

module.exports = GitBook.createPlugin({
    activate: (dispatch, getState, { Components }) => {
        // Dispatch initialization actions
        dispatch(Components.registerComponent(Sharing, { role: 'toolbar:buttons:right' }));
    },
    deactivate: (dispatch, getState) => {
        // Dispatch cleanup actions
    },
    reduce: (state, action) => state
});

/**
 * Displays the group of sharing buttons
 */
let Sharing = React.createClass({
    propTypes: {
        options: optionsShape.isRequired,
        page: GitBook.Shapes.Page.isRequired
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
                <ShareButton sites={options.all.map(id => SITES[id])}
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
    return {
        page: state.page,
        options: state.config.pluginsConfig.sharing || { all: [] }
    };
}

Sharing = GitBook.connect(Sharing, mapStateToProps);

// An individual site sharing button
const SiteButton = React.createClass({
    propTypes: {
        site: siteShape.isRequired,
        onShare: func.isRequired
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

// Share button with dropdown list of sites
const ShareButton = React.createClass({
    propTypes: {
        sites: arrayOf(siteShape).isRequired,
        onShare: func.isRequired
    },

    renderButton({ onToggle }) {
        return (
            <GitBook.Button onClick={onToggle}>
                <GitBook.Icon id="share-alt" />
            </GitBook.Button>
        );
    },

    renderMenu({ onToggle }) {
        const { sites } = this.props;
        const items = sites.map((site) => (
            <GitBook.Dropdown.Item onClick={site.onShare}>
                {site.label}
            </GitBook.Dropdown.Item>
        ));

        return (
            <GitBook.Dropdown.Menu>
                {items}
            </GitBook.Dropdown.Menu>
        );
    },

    render() {
        return (
            <GitBook.Dropdown renderChildren={this.renderButton}
                              renderMenu={this.renderMenu} />
        );
    }
});
