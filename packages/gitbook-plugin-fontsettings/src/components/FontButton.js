const GitBook = require('gitbook-core');
const { React } = GitBook;

const FontButton = React.createClass({
    render() {
        return (
            <GitBook.Button>
                <GitBook.Icon id="font"/>
            </GitBook.Button>
        );
    }
});

module.exports = GitBook.connect(FontButton, (state) => {
    return { font: state.font };
});
