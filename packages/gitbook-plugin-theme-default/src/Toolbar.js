const React = require('react');
const GitBook = require('gitbook-core');

const Toolbar = React.createClass({
    render() {
        return (
            <div className="Toolbar book-toolbar">
                <GitBook.InjectedComponentSet matching={{ role: 'toolbar:buttons:left' }} />
                <GitBook.InjectedComponentSet matching={{ role: 'toolbar:buttons:right' }} />
            </div>
        );
    }
});

module.exports = Toolbar;
