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
                <GitBook.Button onClick={this.onToggle}>
                    <GitBook.Icon id="share-alt" />
                </GitBook.Button>

                {open ? (
                    <Backdrop onClose={this.onToggle}>
                        <Dropdown.Menu>
                            {siteIds.map((id) => (
                                <Dropdown.Item onClick={() => onShare(SITES[id])} key={id}>
                                    {SITES[id].label}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Backdrop>) : null}
            </Dropdown.Container>
        );
    }
});

module.exports = ShareButton;
