const React  = require('react');
const {
    oneOf,
    string,
    shape
} = React.PropTypes;


module.exports = shape({
    mtime: string.isRequired,
    path:  string.isRequired,
    type:  oneOf(['markdown', 'asciidoc']).isRequired
});
