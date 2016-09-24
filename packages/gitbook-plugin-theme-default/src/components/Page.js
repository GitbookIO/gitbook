const React = require('react');
const GitBook = require('gitbook-core');

const Page = React.createClass({
    propTypes: {
        page: GitBook.Shapes.Page
    },

    render() {
        const { page } = this.props;

        return (
            <div className="Page page-wrapper">
                <GitBook.HTMLContent html={page.content} />
            </div>
        );
    }
});

module.exports = Page;
