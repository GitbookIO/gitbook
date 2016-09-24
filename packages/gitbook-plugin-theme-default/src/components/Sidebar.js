const React = require('react');
const GitBook = require('gitbook-core');

const Summary = require('./Summary');

const Sidebar = React.createClass({
    propTypes: {
        summary: GitBook.Shapes.Summary
    },

    render() {
        const { summary } = this.props;

        return (
            <div className="Sidebar book-summary">
                <Summary summary={summary} />
            </div>
        );
    }
});

module.exports = Sidebar;
