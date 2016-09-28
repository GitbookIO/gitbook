const GitBook = require('gitbook-core');
const { React } = GitBook;

const SearchResults = React.createClass({
    propTypes: {
        results: GitBook.Shapes.list
    },

    render() {
        const { results } = this.props;

        return (
            <div className="Search/Results">
                {results.map(result => {

                })}
            </div>
        );
    }
});

function mapStateToProps(state) {
    return {
        results: state.search.results
    };
}

module.exports = GitBook.connect(SearchResults, mapStateToProps);
