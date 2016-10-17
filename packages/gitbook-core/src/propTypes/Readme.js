const React  = require('react');

const {
    shape
} = React.PropTypes;

const File = require('./File');

module.exports = shape({
    file:  File.isRequired
});
