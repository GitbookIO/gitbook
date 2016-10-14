const React  = require('react');
const { listOf } = require('react-immutable-proptypes');
const { shape, string } = React.PropTypes;

const fileShape = require('./File');
const languageShape = require('./Language');

module.exports = shape({
    current: string.isRequired,
    file: fileShape.isRequired,
    list: listOf(languageShape).isRequired
});
