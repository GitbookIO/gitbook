const React  = require('react');
const {
    object,
    shape
} = React.PropTypes;


module.exports = shape({
    store: object,
    actions: object
});
