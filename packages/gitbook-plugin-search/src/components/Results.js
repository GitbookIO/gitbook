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
        query:    React.PropTypes.string,
        results:  GitBook.Shapes.list,
        children: React.PropTypes.node
    },

    render() {
        const { query, results, children } = this.props;

        if (!query) {
            return React.Children.only(children);
        }

        return (
            <div className="Search/ResultsContainer">
                <h1>Results for "{query}"</h1>
                <div className="Search/Results">
                    {results.map((result, i) => {
                        return <Result key={i} result={result} />;
                    })}
                </div>
            </div>
        );
    }
});

const mapStateToProps = (state) => {
    const { results, query } = state.search;
    return { results, query };
};

module.exports = GitBook.connect(SearchResults, mapStateToProps);
