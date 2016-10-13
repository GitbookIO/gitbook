const GitBook = require('gitbook-core');
const {
    React,
    Dropdown
} = GitBook;
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

    getInitialState() {
        return { open: false };
    },

    onToggle() {
        this.setState({ open: !this.state.open });
    },

    render() {
        const { sites } = this.props;

        const items = sites.map((site) => (
            <Dropdown.Item onClick={site.onShare} key={site.label}>
                {site.label}
            </Dropdown.Item>
        ));

        return (
            <Dropdown.Container>
                <GitBook.Button onClick={this.onToggle}>
                    <GitBook.Icon id="share-alt" />
                </GitBook.Button>

                <Dropdown.Menu open={this.state.open}>
                    {items}
                </Dropdown.Menu>
            </Dropdown.Container>
        );
    }
});
