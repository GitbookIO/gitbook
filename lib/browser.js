var Modifiers = require('./modifiers');

module.exports = {
    Parse:              require('./parse'),

    // Models
    Book:               require('./models/book'),
    FS:                 require('./models/fs'),
    Summary:            require('./models/summary'),
    Glossary:           require('./models/glossary'),
    Config:             require('./models/config'),
    PluginDependency:   require('./models/pluginDependency'),

    // Modifiers
    SummaryModifier:    Modifiers.Summary,
    ConfigModifier:     Modifiers.Config,

    // Constants
    CONFIG_FILES:       require('./constants/configFiles.js'),
    IGNORE_FILES:       require('./constants/ignoreFiles.js'),
    DEFAULT_PLUGINS:    require('./constants/defaultPlugins')
};
