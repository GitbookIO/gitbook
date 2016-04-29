var Immutable = require('immutable');

var Options = Immutable.Record({
    // Root folder for the output
    root:               String(),

    // Prefix for generation
    prefix:             String('ebook'),

    // Format to generate using ebook-convert
    format:             String(),

    // Force use of absolute urls ("index.html" instead of "/")
    directoryIndex:     Boolean(false)
});

module.exports = Options;
