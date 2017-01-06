const is = require('is');
const { Record, fromJS } = require('immutable');

const File = require('./file');
const PluginDependency = require('./pluginDependency');
const configDefault = require('../constants/configDefault');
const reducedObject = require('../utils/reducedObject');

const DEFAULTS = {
    file:   new File(),
    values: configDefault
};

class Config extends Record(DEFAULTS) {
    getFile() {
        return this.get('file');
    }

    getValues() {
        return this.get('values');
    }

    /**
     * Return minimum version of configuration,
     * Basically it returns the current config minus the default one
     * @return {Map}
     */
    toReducedVersion() {
        return reducedObject(configDefault, this.getValues());
    }

    /**
     * Render config as text
     * @return {String}
     */
    toText() {
        return JSON.stringify(this.toReducedVersion().toJS(), null, 4);
    }

    /**
     * Change the file for the configuration
     * @param {File} file
     * @return {Config}
     */
    setFile(file) {
        return this.set('file', file);
    }

    /**
     * Return a configuration value by its key path
     * @param {String} key
     * @return {Mixed}
     */
    getValue(keyPath, def) {
        const values = this.getValues();
        keyPath = Config.keyToKeyPath(keyPath);

        if (!values.hasIn(keyPath)) {
            return fromJS(def);
        }

        return values.getIn(keyPath);
    }

    /**
     * Update a configuration value
     * @param {String} key
     * @param {Mixed} value
     * @return {Config}
     */
    setValue(keyPath, value) {
        keyPath = Config.keyToKeyPath(keyPath);

        value = fromJS(value);

        let values = this.getValues();
        values = values.setIn(keyPath, value);

        return this.set('values', values);
    }

    /**
     * Return a list of plugin dependencies
     * @return {List<PluginDependency>}
     */
    getPluginDependencies() {
        const plugins = this.getValue('plugins');

        if (is.string(plugins)) {
            return PluginDependency.listFromString(plugins);
        } else {
            return PluginDependency.listFromArray(plugins);
        }
    }

    /**
     * Return a plugin dependency by its name
     * @param {String} name
     * @return {PluginDependency}
     */
    getPluginDependency(name) {
        const plugins = this.getPluginDependencies();
        return plugins.find((dep) => {
            return dep.getName() === name;
        });
    }

    /**
     * Update the list of plugins dependencies
     * @param {List<PluginDependency>}
     * @return {Config}
     */
    setPluginDependencies(deps) {
        const plugins = PluginDependency.listToArray(deps);
        return this.setValue('plugins', plugins);
    }

    /**
     * Update values for an existing configuration
     * @param {Object} values
     * @returns {Config}
     */
    updateValues(values) {
        values = fromJS(values);
        return this.set('values', values);
    }

    /**
     * Update values for an existing configuration
     * @param {Config} config
     * @param {Object} values
     * @returns {Config}
     */
    mergeValues(values) {
        let currentValues = this.getValues();
        values = fromJS(values);

        currentValues = currentValues.mergeDeep(values);

        return this.set('values', currentValues);
    }

    /**
     * Create a new config for a file
     * @param {File} file
     * @param {Object} values
     * @returns {Config}
     */
    static create(file, values) {
        return new Config({
            file,
            values: fromJS(values)
        });
    }

    /**
     * Create a new config
     * @param {Object} values
     * @returns {Config}
     */
    static createWithValues(values) {
        return new Config({
            values: fromJS(values)
        });
    }


    /**
     * Convert a keyPath to an array of keys
     * @param {String|Array}
     * @return {Array}
     */
    static keyToKeyPath(keyPath) {
        if (is.string(keyPath)) keyPath = keyPath.split('.');
        return keyPath;
    }
}

module.exports = Config;
