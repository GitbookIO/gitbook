const GitBook = require('gitbook-core');
const { React } = GitBook;

const search = require('../actions/search');

const ESCAPE = 27;

const SearchInput = React.createClass({
    propTypes: {
        query:    React.PropTypes.string,
        i18n:     GitBook.PropTypes.I18n,
        dispatch: GitBook.PropTypes.dispatch
    },

    onChange(event) {
        const { dispatch } = this.props;
        const { value } = event.currentTarget;

        dispatch(search.query(value));
    },

    /**
     * On Escape key down, clear the search field
     */
    onKeyDown(e) {
        const { query } = this.props;
        if (e.keyCode == ESCAPE && query != '') {
            e.preventDefault();
            e.stopPropagation();
            this.clearSearch();
        }
    },

    clearSearch() {
        this.props.dispatch(search.query(''));
    },

    render() {
        const { i18n, query } = this.props;

        let clear;
        if (query != '') {
            clear = (
                <span className="Search-Clear"
                      onClick={this.clearSearch}>
                    ✕
                </span>
            );
            // clear = <GitBook.Icon id="x" onClick={this.clearSearch}/>;
        }

        return (
            <div className="Search-Input">
                <input
                    type="text"
                    onKeyDown={this.onKeyDown}
                    value={query}
                    placeholder={i18n.t('SEARCH_PLACEHOLDER')}
                    onChange={this.onChange}
                />

                { clear }
            </div>
        );
    }
});

const mapStateToProps = state => {
    const { query } = state.search;
    return { query };
};

module.exports = GitBook.connect(SearchInput, mapStateToProps);
