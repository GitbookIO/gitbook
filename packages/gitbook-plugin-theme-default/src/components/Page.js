const GitBook = require('gitbook-core');
const { React } = GitBook;

const Page = React.createClass({
    propTypes: {
        page: GitBook.Shapes.Page
    },

    render() {
        const { page } = this.props;

        return (
            <div className="Page page-wrapper">
                <GitBook.InjectedComponent matching={{ role: 'page:container' }} props={this.props}>
                    <GitBook.HTMLContent html={page.content} />
                </GitBook.InjectedComponent>
            </div>
        );
    }
});

module.exports = Page;
