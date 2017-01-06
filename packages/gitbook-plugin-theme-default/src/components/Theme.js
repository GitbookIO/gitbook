const GitBook = require('gitbook-core');
const { React, ReactCSSTransitionGroup } = GitBook;

const Sidebar = require('./Sidebar');
const Body = require('./Body');
const LoadingBar = require('./LoadingBar');

const Theme = React.createClass({
    propTypes: {
        // State
        file:     GitBook.PropTypes.File,
        page:     GitBook.PropTypes.Page,
        summary:  GitBook.PropTypes.Summary,
        readme:   GitBook.PropTypes.Readme,
        history:  GitBook.PropTypes.History,
        sidebar:  React.PropTypes.object,
        // Other props
        children: React.PropTypes.node
    },

    render() {
        const { file, page, summary, children, sidebar, readme, history } = this.props;

        return (
            <GitBook.FlexLayout column className="GitBook book">
                <LoadingBar show={history.loading} />
                <GitBook.Head
                    title={page.title}
                    titleTemplate="%s - GitBook"
                    link={[
                        {rel: 'shortcut icon', href: file.relative('gitbook/theme-default/images/favicon.ico')}
                    ]}
                />
                <GitBook.ImportCSS href="gitbook/theme-default/theme.css" />

                <GitBook.FlexBox>
                    <ReactCSSTransitionGroup
                        component={GitBook.FlexLayout}
                        transitionName="Layout"
                        transitionEnterTimeout={300}
                        transitionLeaveTimeout={300}>
                    {sidebar.open ? (
                        <Sidebar key={0} summary={summary} />
                    ) : null}
                        <div key={1} className="Body-Flex">
                            <Body
                                page={page}
                                readme={readme}
                                history={history}
                            />
                        </div>
                    </ReactCSSTransitionGroup>
                </GitBook.FlexBox>
                {children}
            </GitBook.FlexLayout>
        );
    }
});

module.exports = GitBook.connect(Theme, ({file, page, summary, sidebar, readme, history}) => {
    return { file, page, summary, sidebar, readme, history };
});
