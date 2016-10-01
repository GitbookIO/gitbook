const GitBook = require('gitbook-core');
const { React } = GitBook;

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
                <GitBook.ImportCSS href="gitbook/theme.css" />

                <GitBook.FlexBox>
                    <GitBook.FlexLayout>
                        {sidebar.open ? (
                            <GitBook.FlexBox col={3}>
                                <Sidebar summary={summary} />
                            </GitBook.FlexBox>
                        ) : null}
                        <GitBook.FlexBox col={sidebar.open ? 9 : 12}>
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
    return { page, summary, sidebar };
});

module.exports = GitBook.createPlugin({
    init: (dispatch, state, { Components }) => {
        dispatch(Components.registerComponent(ThemeBody, { role: 'Body' }));
    },
    reduce: reduceState
});
