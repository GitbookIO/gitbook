const React = require('react');
const GitBook = require('gitbook-core');

const Page = require('./Page');
const Toolbar = require('./Toolbar');

const Body = React.createClass({
    propTypes: {
        page: GitBook.Shapes.Page
    },

    render() {
        const { page } = this.props;

        return (
            <div className="Body page-wrapper">
                <Toolbar />
                <Page page={page} />
            </div>
        );
    }
});

module.exports = Body;
