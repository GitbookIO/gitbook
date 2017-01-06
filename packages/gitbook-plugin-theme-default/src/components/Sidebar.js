const GitBook = require('gitbook-core');
const { React } = GitBook;

const Summary = require('./Summary');

/**
 * The GitBook trademark.
 * @type {ReactClass}
 */
const GitBookTrademark = React.createClass({
    render() {
        return (
            <a className="GitBookTrademark" href="https://www.gitbook.com/?utm_source=gitbook&utm_medium=trademark">
                <span>Published with <b>GitBook</b></span>
                <GitBook.Image src="gitbook/theme-default/images/logo.svg" />
            </a>
        );
    }
});

/**
 * Sidebar containing a serch bar, the table of contents, and the GitBook trademark.
 * @type {ReactClass}
 */
const Sidebar = React.createClass({
    propTypes: {
        summary: GitBook.PropTypes.Summary
    },

    render() {
        const { summary } = this.props;

        return (
            <div className="Sidebar-Flex">
                <div className="Sidebar book-summary">
                    <GitBook.InjectedComponent matching={{ role: 'search:container:input' }} />
                    <Summary summary={summary} />

                    <GitBookTrademark />
                </div>
            </div>
        );
    }
});

module.exports = Sidebar;
