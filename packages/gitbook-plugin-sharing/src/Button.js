const React = require('react');
const GitBook = require('gitbook-core');

const ShareButton = React.createClass({
    render() {
        return (
            <button>Share</button>
        );
    }
});

function mapStateToProps(state) {

}


module.exports = GitBook.connect(ShareButton, mapStateToProps);
