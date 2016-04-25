var Immutable = require('immutable');

var Options = Immutable.Record({
    // Root folder for the output
    root:       String(),

    // Prefix for generation
    prefix:     String('website')
});

module.exports = Options;
