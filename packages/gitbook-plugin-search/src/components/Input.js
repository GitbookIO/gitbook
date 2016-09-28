const GitBook = require('gitbook-core');
const { React } = GitBook;

const search = require('../actions/search');

const DEBOUNCE_MS = 600;

const SearchInput = React.createClass({
    propTypes: {
        dispatch: React.PropTypes.func
    },

    onUpdateQuery(q) {
        const { dispatch } = this.props;

        dispatch(search.query(q));
    },

    onKeyDown(event) {
        const { value } = event.currentTarget;

        if (this.debouncedSearch) {
            clearTimeout(this.debouncedSearch);
        }

        this.debouncedSearch = setTimeout(() => {
            this.debouncedSearch = null;
            this.onUpdateQuery(value);
        }, DEBOUNCE_MS);
    },

    componentWillUnmount() {
        if (this.debouncedSearch) {
            clearTimeout(this.debouncedSearch);
        }
    },

    render() {
        return (
            <div className="Search/Input">
                <input type="text" placeholder="" onKeyDown={this.onKeyDown} />
            </div>
        );
    }
});

module.exports = GitBook.connect(SearchInput);
