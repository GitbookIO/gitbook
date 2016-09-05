const jsonschema = require('jsonschema');
const jsonSchemaDefaults = require('json-schema-defaults');

const schema = require('../constants/configSchema');
const error = require('../utils/error');
const mergeDefaults = require('../utils/mergeDefaults');

/**
    Validate a book.json content
    And return a mix with the default value

    @param {Object} bookJson
    @return {Object}
*/
function validateConfig(bookJson) {
    const v = new jsonschema.Validator();
    const result = v.validate(bookJson, schema, {
        propertyName: 'config'
    });

    // Throw error
    if (result.errors.length > 0) {
        throw new error.ConfigurationError(new Error(result.errors[0].stack));
    }

    // Insert default values
    const defaults = jsonSchemaDefaults(schema);
    return mergeDefaults(bookJson, defaults);
}

module.exports = validateConfig;
