const GitBook = require('gitbook-core');
const { React } = GitBook;
const Highlight = require('react-highlighter');

const Result = React.createClass({
    propTypes: {
        result: React.PropTypes.object,
        query:  React.PropTypes.string
    },

    render() {
        const { result, query } = this.props;

        return (
            <div className="Search-ResultContainer">
                <GitBook.InjectedComponent matching={{ role: 'search:result' }} props={{ result, query }}>
                    <div className="Search-Result">
                        <h3>
                            <GitBook.Link to={result.url}>{result.title}</GitBook.Link>
                        </h3>
                        <p>
                            <Highlight
                            matchElement="span"
                            matchClass="Search-MatchSpan"
                            search={query}>
                                {result.body}
                            </Highlight>
                        </p>
                    </div>
                </GitBook.InjectedComponent>
            </div>
        );
    }
});

const SearchResults = React.createClass({
    propTypes: {
        i18n:     GitBook.Shapes.I18n,
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
                <GitBook.InjectedComponent matching={{ role: 'search:results' }} props={{ results, query }}>
                    <div className="Search-Results">
                        <h1>{i18n.t('SEARCH_RESULTS_TITLE', { query, count: results.size })}</h1>
                        <div className="Search-Results">
                            {results.map((result, i) => {
                                return <Result key={i} result={result} query={query} />;
                            })}
                        </div>
                    </div>
                </GitBook.InjectedComponent>
            </div>
        );
    }
});

const mapStateToProps = (state) => {
    const { results, query } = state.search;
    return { results, query };
};

module.exports = GitBook.connect(SearchResults, mapStateToProps);
