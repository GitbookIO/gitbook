const {
    string,
    func,
    shape
} = require('gitbook-core').React.PropTypes;

const siteShape = shape({
    label: string.isRequired,
    icon: string.isRequired,
    onShare: func.isRequired
});

module.exports = siteShape;
