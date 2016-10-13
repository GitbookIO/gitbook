const GitBook = require('gitbook-core');
const { React, Dropdown } = GitBook;

const SITES = require('../SITES');

// Share button with dropdown list of sites
const ShareButton = React.createClass({
    propTypes: {
        siteIds: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        onShare: React.PropTypes.func.isRequired
    },

    getInitialState() {
        return { open: false };
    },

    onToggle() {
        this.setState({ open: !this.state.open });
    },

    render() {
        const { siteIds, onShare } = this.props;

        const items = siteIds.map((id) => (
            <Dropdown.Item onClick={() => onShare(SITES[id])} key={id}>
                {SITES[id].label}
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

module.exports = ShareButton;
