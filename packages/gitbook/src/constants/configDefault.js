const Immutable = require('immutable');
const jsonSchemaDefaults = require('json-schema-defaults');

const schema = require('./configSchema');

module.exports = Immutable.fromJS(jsonSchemaDefaults(schema));
