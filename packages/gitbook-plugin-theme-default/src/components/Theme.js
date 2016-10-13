const GitBook = require('gitbook-core');
const { React } = GitBook;

const Sidebar = require('./Sidebar');
const Body = require('./Body');

const Theme = React.createClass({
    propTypes: {
        // State
        page:     GitBook.Shapes.Page,
        summary:  GitBook.Shapes.Summary,
        readme:   GitBook.Shapes.Readme,
        sidebar:  React.PropTypes.object,
        // Other props
        children: React.PropTypes.node
    },

    render() {
        const { page, summary, children, sidebar, readme } = this.props;

        return (
            <GitBook.FlexLayout column className="GitBook book">
                <GitBook.Head
                    title={page.title}
                    titleTemplate="%s - GitBook" />
                <GitBook.ImportCSS href="gitbook/theme-default/theme.css" />

                <GitBook.FlexBox>
                    <GitBook.FlexLayout>
                        {sidebar.open ? (
                            <GitBook.FlexBox col={3}>
                                <Sidebar summary={summary} />
                            </GitBook.FlexBox>
                        ) : null}
                        <GitBook.FlexBox col={sidebar.open ? 9 : 12}>
                            <Body page={page} readme={readme} />
                        </GitBook.FlexBox>
                    </GitBook.FlexLayout>
                </GitBook.FlexBox>
                {children}
            </GitBook.FlexLayout>
        );
    }
});

module.exports = GitBook.connect(Theme, ({page, summary, sidebar, readme}) => {
    return { page, summary, sidebar, readme };
});
