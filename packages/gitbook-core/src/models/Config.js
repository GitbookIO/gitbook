const { Record, Map, fromJS } = require('immutable');

const DEFAULTS = {
    title:         String(),
    pluginsConfig: Map()
};

/**
 * Configuration from the book.
 * @type {Class}
 */
class Config extends Record(DEFAULTS) {

    /**
     * Create a config instance from values.
     * @param  {Mixed} values
     * @return {Config}
     */
    static create(values) {
        return (values instanceof Config) ?
            values :
            new Config(fromJS(values));
    }

    /**
     * Get configuration for a plugin.
     * @param  {String} pluginName
     * @return {Map}
     */
    getForPlugin(pluginName) {
        return this.getIn([
            'pluginsConfig', pluginName
        ]);
    }

}

module.exports = Config;
