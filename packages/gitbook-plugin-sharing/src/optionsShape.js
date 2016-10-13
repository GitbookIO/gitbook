const {
    bool,
    arrayOf,
    oneOf,
    shape
} = require('gitbook-core').React.PropTypes;

const { ALL } = require('./SITES');

const optionsShape = shape({
    facebook: bool,
    twitter: bool,
    google: bool,
    weibo: bool,
    instapaper: bool,
    vk: bool,
    all: arrayOf(oneOf(ALL)).isRequired
});

module.exports = optionsShape;
