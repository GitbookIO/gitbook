const GitBook = require('gitbook-core');
const { React } = GitBook;

const Page = require('./Page');
const Toolbar = require('./Toolbar');

const Body = React.createClass({
    propTypes: {
        page:   GitBook.Shapes.Page,
        readme: GitBook.Shapes.Readme
    },

    render() {
        const { page, readme } = this.props;

        return (
            <div className="Body page-wrapper">
                <Toolbar title={page.title} readme={readme} />
                <Page page={page} />
            </div>
        );
    }
});

module.exports = Body;
