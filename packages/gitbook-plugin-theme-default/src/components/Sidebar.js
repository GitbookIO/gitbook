const GitBook = require('gitbook-core');
const { React } = GitBook;

const Summary = require('./Summary');

const Sidebar = React.createClass({
    propTypes: {
        summary: GitBook.Shapes.Summary
    },

    render() {
        const { summary } = this.props;

        return (
            <div className="Sidebar book-summary">
                <GitBook.InjectedComponent matching={{ role: 'search:container:input' }} />
                <Summary summary={summary} />
            </div>
        );
    }
});

module.exports = Sidebar;
