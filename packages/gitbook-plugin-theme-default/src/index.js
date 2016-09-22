const React = require('react');
const GitBook = require('gitbook-core');

const Sidebar = require('./Sidebar');
const Page = require('./Page');
const Toolbar = require('./Toolbar');

let ThemeBody = React.createClass({
    propTypes: {
        page:     GitBook.Shapes.Page,
        summary:  GitBook.Shapes.Summary,
        children: React.PropTypes.node
    },

    render() {
        const { page, summary, children } = this.props;

        return (
            <div className="GitBook book">
                <GitBook.Head
                    title={page.title}
                    titleTemplate="%s - GitBook" />
                <GitBook.ImportCSS href="gitbook/gitbook-plugin-theme-default/theme.css" />

                <Toolbar />
                <Sidebar summary={summary} />
                <Page page={page} />
                {children}
            </div>
        );
    }
});

ThemeBody = GitBook.connect(ThemeBody, ({page, summary}) => {
    return { page, summary };
});

module.exports = GitBook.createPlugin((dispatch, state) => {
    dispatch(GitBook.registerComponent(ThemeBody, { role: 'Body' }));
});
