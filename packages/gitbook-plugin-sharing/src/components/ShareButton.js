const GitBook = require('gitbook-core');
const { React, Dropdown, Backdrop } = GitBook;

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
        const { open } = this.state;
        this.setState({ open: !open });
    },

    render() {
        const { siteIds, onShare } = this.props;
        const { open } = this.state;

        return (
            <Dropdown.Container>
                {open ? <Backdrop onClose={this.onToggle} /> : null}

                <GitBook.Button onClick={this.onToggle}>
                    <GitBook.Icon id="share-alt" />
                </GitBook.Button>

                {open ? (
                    <Dropdown.Menu>
                        {siteIds.map((id) => (
                            <Dropdown.ItemLink onClick={() => onShare(SITES[id])} key={id}>
                                {SITES[id].label}
                            </Dropdown.ItemLink>
                        ))}
                    </Dropdown.Menu>) : null}
            </Dropdown.Container>
        );
    }
});

module.exports = ShareButton;
