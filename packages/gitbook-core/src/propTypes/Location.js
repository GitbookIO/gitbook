const React  = require('react');
const { map } = require('react-immutable-proptypes');
const {
    string,
    shape
} = React.PropTypes;

module.exports = shape({
    pathname: string,
    hash:     string,
    query:    map
});
