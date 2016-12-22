/**
 * Return the configuration for a plugin
 * @param {Config} config
 * @param {String} pluginName
 * @return {Object}
 */
function getPluginConfig(config, pluginName) {
    const pluginsConfig = config.getValues().get('pluginsConfig');
    if (pluginsConfig === undefined) {
        return {};
    }
    const pluginConf = pluginsConfig.get(pluginName);
    if (pluginConf === undefined) {
        return {};
    } else {
        return pluginConf.toJS();
    }
}

module.exports = getPluginConfig;
