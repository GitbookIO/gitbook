const GitBook = require('gitbook-core');
const { React } = GitBook;

/**
 * Container for the page.
 * @type {ReactClass}
 */
const Page = React.createClass({
    propTypes: {
        page: GitBook.PropTypes.Page
    },

    render() {
        const { page } = this.props;

        return (
            <div className="PageContainer">
                <GitBook.InjectedComponent matching={{ role: 'search:container:results' }} props={this.props}>
                    <div className="Page">
                        <GitBook.InjectedComponentSet matching={{ role: 'page:header' }} props={this.props} />

                        <GitBook.InjectedComponent matching={{ role: 'page:container' }} props={this.props}>
                            <GitBook.PageContent document={page.document} />
                        </GitBook.InjectedComponent>

                        <GitBook.InjectedComponentSet matching={{ role: 'page:footer' }} props={this.props} />
                    </div>
                </GitBook.InjectedComponent>
            </div>
        );
    }
});

module.exports = Page;
