const Immutable = require('immutable');

const Options = Immutable.Record({
    // Root folder for the output
    root:       String()
});

module.exports = Options;
