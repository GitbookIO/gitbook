const React = require('react');
const GitBook = require('gitbook-core');

const Sidebar = require('./components/Sidebar');
const Body = require('./components/Body');

const reduceState = require('./reducers');

let ThemeBody = React.createClass({
    propTypes: {
        // State
        page:     GitBook.Shapes.Page,
        summary:  GitBook.Shapes.Summary,
        sidebar:  React.PropTypes.object,
        // Other props
        children: React.PropTypes.node
    },

    render() {
        const { page, summary, children, sidebar } = this.props;

        return (
            <GitBook.FlexLayout column className="GitBook book">
                <GitBook.Head
                    title={page.title}
                    titleTemplate="%s - GitBook" />
                <GitBook.ImportCSS href="gitbook/gitbook-plugin-theme-default/theme.css" />

                <GitBook.FlexBox>
                    <GitBook.FlexLayout>
                        {sidebar.open ? (
                            <GitBook.FlexBox col={3}>
                                <Sidebar summary={summary} />
                            </GitBook.FlexBox>
                        ) : null}
                        <GitBook.FlexBox col={9}>
                            <Body page={page} />
                        </GitBook.FlexBox>
                    </GitBook.FlexLayout>
                </GitBook.FlexBox>
                {children}
            </GitBook.FlexLayout>
        );
    }
});

ThemeBody = GitBook.connect(ThemeBody, ({page, summary, sidebar}) => {
    console.log('connect', sidebar.toJS())
    return { page, summary, sidebar };
});

module.exports = GitBook.createPlugin((dispatch, state) => {
    dispatch(GitBook.registerComponent(ThemeBody, { role: 'Body' }));
}, reduceState);
