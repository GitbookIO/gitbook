const is = require('is');
const Immutable = require('immutable');

const File = require('./file');
const PluginDependency = require('./pluginDependency');
const configDefault = require('../constants/configDefault');
const reducedObject = require('../utils/reducedObject');

const Config = Immutable.Record({
    file:       File(),
    values:     configDefault
}, 'Config');

Config.prototype.getFile = function() {
    return this.get('file');
};

Config.prototype.getValues = function() {
    return this.get('values');
};

/**
 * Return minimum version of configuration,
 * Basically it returns the current config minus the default one
 * @return {Map}
 */
Config.prototype.toReducedVersion = function() {
    return reducedObject(configDefault, this.getValues());
};

/**
 * Render config as text
 * @return {Promise<String>}
 */
Config.prototype.toText = function() {
    return JSON.stringify(this.toReducedVersion().toJS(), null, 4);
};

/**
 * Change the file for the configuration
 * @param {File} file
 * @return {Config}
 */
Config.prototype.setFile = function(file) {
    return this.set('file', file);
};

/**
 * Return a configuration value by its key path
 * @param {String} key
 * @return {Mixed}
 */
Config.prototype.getValue = function(keyPath, def) {
    const values = this.getValues();
    keyPath = Config.keyToKeyPath(keyPath);

    if (!values.hasIn(keyPath)) {
        return Immutable.fromJS(def);
    }

    return values.getIn(keyPath);
};

/**
 * Update a configuration value
 * @param {String} key
 * @param {Mixed} value
 * @return {Config}
 */
Config.prototype.setValue = function(keyPath, value) {
    keyPath = Config.keyToKeyPath(keyPath);

    value = Immutable.fromJS(value);

    let values = this.getValues();
    values = values.setIn(keyPath, value);

    return this.set('values', values);
};

/**
 * Return a list of plugin dependencies
 * @return {List<PluginDependency>}
 */
Config.prototype.getPluginDependencies = function() {
    const plugins = this.getValue('plugins');

    if (is.string(plugins)) {
        return PluginDependency.listFromString(plugins);
    } else {
        return PluginDependency.listFromArray(plugins);
    }
};

/**
 * Return a plugin dependency by its name
 * @param {String} name
 * @return {PluginDependency}
 */
Config.prototype.getPluginDependency = function(name) {
    const plugins = this.getPluginDependencies();

    return plugins.find((dep) => {
        return dep.getName() === name;
    });
};

/**
 * Update the list of plugins dependencies
 * @param {List<PluginDependency>}
 * @return {Config}
 */
Config.prototype.setPluginDependencies = function(deps) {
    const plugins = PluginDependency.listToArray(deps);

    return this.setValue('plugins', plugins);
};


/**
 * Update values for an existing configuration
 * @param {Object} values
 * @returns {Config}
 */
Config.prototype.updateValues = function(values) {
    values = Immutable.fromJS(values);

    return this.set('values', values);
};

/**
 * Update values for an existing configuration
 * @param {Config} config
 * @param {Object} values
 * @returns {Config}
 */
Config.prototype.mergeValues = function(values) {
    let currentValues = this.getValues();
    values = Immutable.fromJS(values);

    currentValues = currentValues.mergeDeep(values);

    return this.set('values', currentValues);
};

/**
 * Create a new config for a file
 * @param {File} file
 * @param {Object} values
 * @returns {Config}
 */
Config.create = function(file, values) {
    return new Config({
        file,
        values: Immutable.fromJS(values)
    });
};

/**
 * Create a new config
 * @param {Object} values
 * @returns {Config}
 */
Config.createWithValues = function(values) {
    return new Config({
        values: Immutable.fromJS(values)
    });
};


/**
 * Convert a keyPath to an array of keys
 * @param {String|Array}
 * @return {Array}
 */
Config.keyToKeyPath = function(keyPath) {
    if (is.string(keyPath)) keyPath = keyPath.split('.');
    return keyPath;
};

module.exports = Config;
