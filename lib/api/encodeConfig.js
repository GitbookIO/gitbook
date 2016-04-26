var objectPath = require('object-path');
var deprecate = require('./deprecate');

/**
    Encode a config object into a JS config api

    @param {Output} output
    @param {Config} config
    @return {Object}
*/
function encodeConfig(output, config) {
    var result = {
        values: config.getValues().toJS(),

        get: function(key, defaultValue) {
            return objectPath.get(result.values, key, defaultValue);
        },

        set: function(key, value) {
            return objectPath.set(result.values, key, value);
        }
    };

    deprecate.field(output, 'config.options', result, 'options',
        result.values, '"config.options" property is deprecated, use "config.get(key)" instead');

    return result;
}

module.exports = encodeConfig;
