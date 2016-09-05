var Immutable = require('immutable');
var jsonschema = require('jsonschema');
var jsonSchemaDefaults = require('json-schema-defaults');

var Promise = require('../utils/promise');
var error = require('../utils/error');
var mergeDefaults = require('../utils/mergeDefaults');

/**
    Validate one plugin for a book and update book's confiration

    @param {Book}
    @param {Plugin}
    @return {Book}
*/
function validatePluginConfig(book, plugin) {
    var config = book.getConfig();
    var packageInfos = plugin.getPackage();

    var configKey = [
        'pluginsConfig',
        plugin.getName()
    ].join('.');

    var pluginConfig = config.getValue(configKey, {}).toJS();

    var schema = (packageInfos.get('gitbook') || Immutable.Map()).toJS();
    if (!schema) return book;

    // Normalize schema
    schema.id = '/' + configKey;
    schema.type = 'object';

    // Validate and throw if invalid
    var v = new jsonschema.Validator();
    var result = v.validate(pluginConfig, schema, {
        propertyName: configKey
    });

    // Throw error
    if (result.errors.length > 0) {
        throw new error.ConfigurationError(new Error(result.errors[0].stack));
    }

    // Insert default values
    var defaults = jsonSchemaDefaults(schema);
    pluginConfig = mergeDefaults(pluginConfig, defaults);


    // Update configuration
    config = config.setValue(configKey, pluginConfig);

    // Return new book
    return book.set('config', config);
}

/**
    Validate a book configuration for plugins and
    returns an update configuration with default values.

    @param {Book}
    @param {OrderedMap<String:Plugin>}
    @return {Promise<Book>}
*/
function validateConfig(book, plugins) {
    return Promise.reduce(plugins, function(newBook, plugin) {
        return validatePluginConfig(newBook, plugin);
    }, book);
}

module.exports = validateConfig;
