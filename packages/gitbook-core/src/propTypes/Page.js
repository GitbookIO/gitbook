const React  = require('react');
const {
    oneOf,
    string,
    number,
    shape
} = React.PropTypes;


module.exports = shape({
    title:   string.isRequired,
    content: string.isRequired,
    level:   string.isRequired,
    depth:   number.isRequired,
    dir:     oneOf(['ltr', 'rtl']).isRequired
});
