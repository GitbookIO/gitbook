var is = require('is');
var Immutable = require('immutable');

var File = require('./file');

var Config = Immutable.Record({
    file:       File(),
    values:     Immutable.Map()
});

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
    if (is.string(keyPath)) keyPath = keyPath.split('.');

    return values.getIn(keyPath) || def;
};

/**
    Create a new config, throw error if invalid

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


module.exports = Config;
