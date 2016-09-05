const Immutable = require('immutable');
const jsonschema = require('jsonschema');
const jsonSchemaDefaults = require('json-schema-defaults');

const Promise = require('../utils/promise');
const error = require('../utils/error');
const mergeDefaults = require('../utils/mergeDefaults');

/**
    Validate one plugin for a book and update book's confiration

    @param {Book}
    @param {Plugin}
    @return {Book}
*/
function validatePluginConfig(book, plugin) {
    let config = book.getConfig();
    const packageInfos = plugin.getPackage();

    const configKey = [
        'pluginsConfig',
        plugin.getName()
    ].join('.');

    let pluginConfig = config.getValue(configKey, {}).toJS();

    const schema = (packageInfos.get('gitbook') || Immutable.Map()).toJS();
    if (!schema) return book;

    // Normalize schema
    schema.id = '/' + configKey;
    schema.type = 'object';

    // Validate and throw if invalid
    const v = new jsonschema.Validator();
    const result = v.validate(pluginConfig, schema, {
        propertyName: configKey
    });

    // Throw error
    if (result.errors.length > 0) {
        throw new error.ConfigurationError(new Error(result.errors[0].stack));
    }

    // Insert default values
    const defaults = jsonSchemaDefaults(schema);
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
