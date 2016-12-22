const React  = require('react');
const { listOf } = require('react-immutable-proptypes');

const {
    shape
} = React.PropTypes;

const File = require('./File');
const Part = require('./SummaryPart');

module.exports = shape({
    file:  File.isRequired,
    parts: listOf(Part).isRequired
});
