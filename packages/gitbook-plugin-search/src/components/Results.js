const GitBook = require('gitbook-core');
const { React } = GitBook;

const Result = React.createClass({
    propTypes: {
        result: React.PropTypes.object
    },

    render() {
        const { result } = this.props;

        return (
            <div className="Search-Result">
                <h3>{result.title}</h3>
                <p>{result.body}</p>
            </div>
        );
    }
});

const SearchResults = React.createClass({
    propTypes: {
        i18n:     GitBook.Shapes.i18n,
        results:  GitBook.Shapes.list,
        query:    React.PropTypes.string,
        children: React.PropTypes.node
    },

    render() {
        const { i18n, query, results, children } = this.props;

        if (!query) {
            return React.Children.only(children);
        }

        return (
            <div className="Search-ResultsContainer">
                <h1>{i18n.t('SEARCH_RESULTS_TITLE', { query, count: results.size })}</h1>
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
