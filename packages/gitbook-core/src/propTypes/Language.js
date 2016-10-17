const React  = require('react');
const { string, shape } = React.PropTypes;

module.exports = shape({
    id:    string.isRequired,
    title: string.isRequired
});
