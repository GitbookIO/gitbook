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
                <button onClick={this.onToggle}>Toggle</button>
                <GitBook.InjectedComponentSet matching={{ role: 'toolbar:buttons:left' }} />
                <GitBook.InjectedComponentSet matching={{ role: 'toolbar:buttons:right' }} />
            </div>
        );
    }
});

module.exports = GitBook.connect(Toolbar);
