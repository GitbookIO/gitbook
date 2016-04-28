var Modifiers = require('./modifiers');

module.exports = {
    Parse:              require('./parse'),

    // Models
    Book:               require('./models/book'),
    FS:                 require('./models/fs'),
    Summary:            require('./models/summary'),
    Glossary:           require('./models/glossary'),

    // Modifiers
    SummaryModifier: Modifiers.Summary
};
