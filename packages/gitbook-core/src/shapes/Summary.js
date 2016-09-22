const React  = require('react');
const {
    arrayOf,
    shape
} = React.PropTypes;

const File = require('./File');
const Part = require('./SummaryPart');

module.exports = shape({
    file:  File.isRequired,
    parts: arrayOf(Part).isRequired
});
