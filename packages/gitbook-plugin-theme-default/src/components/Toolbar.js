const React = require('react');
const GitBook = require('gitbook-core');

const sidebar = require('../actions/sidebar');

const Toolbar = React.createClass({
    propTypes: {
        dispatch: React.PropTypes.func
    },

    onToggle() {
        const { dispatch } = this.props;
        dispatch(sidebar.toggle());
    },

    render() {
        return (
            <div className="Toolbar book-toolbar">
                <GitBook.Button onClick={this.onToggle}>
                    <GitBook.Icon id="align-justify" />
                </GitBook.Button>
                <GitBook.InjectedComponentSet matching={{ role: 'toolbar:buttons:left' }} />
                <GitBook.InjectedComponentSet matching={{ role: 'toolbar:buttons:right' }} />
            </div>
        );
    }
});

module.exports = GitBook.connect(Toolbar);
