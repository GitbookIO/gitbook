const React  = require('react');
const {
    oneOf,
    string,
    instanceOf,
    shape
} = React.PropTypes;


module.exports = shape({
    mtime: instanceOf(Date).isRequired,
    path:  string.isRequired,
    type:  oneOf(['markdown', 'asciidoc']).isRequired
});
