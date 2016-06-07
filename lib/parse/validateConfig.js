var jsonschema = require('jsonschema');
var jsonSchemaDefaults = require('json-schema-defaults');

var schema = require('../constants/configSchema');
var error = require('../utils/error');
var mergeDefaults = require('../utils/mergeDefaults');

/**
    Validate a book.json content
    And return a mix with the default value

    @param {Object} bookJson
    @return {Object}
*/
function validateConfig(bookJson) {
    var v = new jsonschema.Validator();
    var result = v.validate(bookJson, schema, {
        propertyName: 'config'
    });

    // Throw error
    if (result.errors.length > 0) {
        throw new error.ConfigurationError(new Error(result.errors[0].stack));
    }

    // Insert default values
    var defaults = jsonSchemaDefaults(schema);
    return mergeDefaults(bookJson, defaults);
}

module.exports = validateConfig;
