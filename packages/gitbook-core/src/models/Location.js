const { Record, Map } = require('immutable');
const querystring = require('querystring');

const DEFAULTS = {
    pathname: String(''),
    // Hash without the #
    hash:     String(''),
    // If query is a non empty map
    query:    Map()
};

class Location extends Record(DEFAULTS) {

    /**
     * Return search query as a string
     * @return {String}
     */
    get search() {
        const { query } = this;
        return query.size === 0 ?
            '' :
            '?' + querystring.stringify(query.toJS());
    }

    /**
     * Convert this location to a string.
     * @return {String}
     */
    toString() {

    }

    /**
     * Convert this immutable instance to an object
     * for "history".
     * @return {Object}
     */
    toNative() {
        return {
            pathname: this.pathname,
            hash:     this.hash ? `#${this.hash}` : '',
            search:   this.search
        };
    }

    /**
     * Convert an instance from "history" to Location.
     * @param {Object|String} location
     * @return {Location}
     */
    static fromNative(location) {
        if (typeof location === 'string') {
            location = { pathname: location };
        }

        const pathname = location.pathname;
        let hash = location.hash || '';
        let search = location.search || '';
        let query = location.query;

        hash = hash[0] === '#' ? hash.slice(1) : hash;
        search = search[0] === '?' ? search.slice(1) : search;

        if (query) {
            query = Map(query);
        } else {
            query = Map(querystring.parse(search));
        }

        return new Location({
            pathname,
            hash,
            query
        });
    }
}

module.exports = Location;
