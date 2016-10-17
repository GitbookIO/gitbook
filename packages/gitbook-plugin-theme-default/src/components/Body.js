const GitBook = require('gitbook-core');
const { React } = GitBook;

const Page = require('./Page');
const Toolbar = require('./Toolbar');

const Body = React.createClass({
    propTypes: {
        page:   GitBook.PropTypes.Page,
        readme: GitBook.PropTypes.Readme
    },

    render() {
        const { page, readme } = this.props;

        return (
            <GitBook.InjectedComponent matching={{ role: 'body:wrapper' }}>
                <div className="Body page-wrapper">
                    <GitBook.InjectedComponent matching={{ role: 'toolbar:wrapper' }}>
                        <Toolbar title={page.title} readme={readme} />
                    </GitBook.InjectedComponent>
                    <GitBook.InjectedComponent matching={{ role: 'page:wrapper' }}>
                        <Page page={page} />
                    </GitBook.InjectedComponent>
                </div>
            </GitBook.InjectedComponent>
        );
    }
});

module.exports = Body;
