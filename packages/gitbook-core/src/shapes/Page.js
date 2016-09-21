const React  = require('react');
const {
    string,
    shape
} = React.PropTypes;


module.exports = shape({
    title:   string.isRequired,
    content: string.isRequired
});
