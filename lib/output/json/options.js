var Immutable = require('immutable');

var Options = Immutable.Record({
    // Root folder for the output
    root:       String()
});

module.exports = Options;
