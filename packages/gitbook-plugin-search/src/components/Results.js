const GitBook = require('gitbook-core');
const { React } = GitBook;

const Result = React.createClass({
    propTypes: {
        result: React.PropTypes.object
    },

    render() {
        const { result } = this.props;

        return (
            <div className="Search/Result">
                <h3>{result.title}</h3>
                <p>{result.body}</p>
            </div>
        );
    }
});

const SearchResults = React.createClass({
    propTypes: {
        results: GitBook.Shapes.list
    },

    render() {
        const { results } = this.props;

        return (
            <div className="Search/Results">
                {results.map((result, i) => {
                    return <Result key={i} result={result} />;
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
