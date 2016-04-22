var is = require('is');
var Immutable = require('immutable');

var File = require('./file');

var Config = Immutable.Record({
    file:       File(),
    values:     Immutable.Map()
}, 'Config');

Config.prototype.getPath = function() {
    return this.get('path');
};

Config.prototype.getValues = function() {
    return this.get('values');
};

/**
    Return a configuration value by its key path

    @param {String} key
    @return {Mixed}
*/
Config.prototype.getValue = function(keyPath, def) {
    var values = this.getValues();
    keyPath = Config.keyToKeyPath(keyPath);

    if (!values.hasIn(keyPath)) {
        return def;
    }

    return values.getIn(keyPath);
};

/**
    Update a configuration value

    @param {String} key
    @param {Mixed} value
    @return {Mixed}
*/
Config.prototype.setValue = function(keyPath, value) {
    keyPath = Config.keyToKeyPath(keyPath);

    value = Immutable.fromJS(value);

    var values = this.getValues();
    values = values.setIn(keyPath, value);

    return this.set('values', values);
};

/**
    Create a new config for a file

    @param {File} file
    @param {Object} values
    @returns {Config}
*/
Config.create = function(file, values) {
    return new Config({
        file: file,
        values: Immutable.fromJS(values)
    });
};

/**
    Create a new config

    @param {Object} values
    @returns {Config}
*/
Config.createWithValues = function(values) {
    return new Config({
        values: Immutable.fromJS(values)
    });
};

/**
    Update values for an existing configuration

    @param {Config} config
    @param {Object} values
    @returns {Config}
*/
Config.updateValues = function(config, values) {
    values = Immutable.fromJS(values);

    return config.set('values', values);
};


/**
    Convert a keyPath to an array of keys

    @param {String|Array}
    @return {Array}
*/
Config.keyToKeyPath = function(keyPath) {
    if (is.string(keyPath)) keyPath = keyPath.split('.');
    return keyPath;
};

module.exports = Config;
