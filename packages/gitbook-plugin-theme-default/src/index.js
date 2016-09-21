const React = require('react');
const GitBook = require('gitbook-core');

const Sidebar = require('./Sidebar');
const Page = require('./Page');

let ThemeBody = React.createClass({
    propTypes: {
        page: GitBook.Shapes.Page
    },

    render() {
        const { page } = this.props;

        return (
            <div className="GitBook book">
                <GitBook.Head
                    title={page.title}
                    titleTemplate="%s - GitBook"
                />

                <Sidebar />
                <Page page={page} />
            </div>
        );
    }
});

ThemeBody = GitBook.connect(ThemeBody, ({page}) => {
    return { page };
});

module.exports = GitBook.createPlugin((dispatch, state) => {
    dispatch(GitBook.registerComponent(ThemeBody, { role: 'Body' }));
});
