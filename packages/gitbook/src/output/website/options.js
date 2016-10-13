const Immutable = require('immutable');

const Options = Immutable.Record({
    // Root folder for the output
    root:   String(),
    // Prefix for generation
    prefix: String('website')
});

module.exports = Options;
