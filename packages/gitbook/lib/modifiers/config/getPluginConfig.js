/**
 * Return the configuration for a plugin
 * @param {Config} config
 * @param {String} pluginName
 * @return {Object}
 */
function getPluginConfig(config, pluginName) {
    var pluginsConfig = config.getValues().get('pluginsConfig');
    if (pluginsConfig === undefined) {
        return {};
    }
    var pluginConf = pluginsConfig.get(pluginName);
    if (pluginConf === undefined) {
        return {};
    } else {
        return pluginConf.toJS();
    }
}

module.exports = getPluginConfig;
