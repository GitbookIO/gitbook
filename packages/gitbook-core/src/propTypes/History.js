const React = require('react');
const locationShape = require('./Location');
const {
    bool,
    shape
} = React.PropTypes;

module.exports = shape({
    loading: bool,
    location: locationShape
});
