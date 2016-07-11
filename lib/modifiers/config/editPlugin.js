
/**
 * Edit configuration of a plugin
 * @param {Config} config
 * @param {String} plugin
 * @param {Object} pluginConfig
 * @return {Config}
 */
function editPlugin(config, pluginName, pluginConfig) {
    return config.setValue('pluginsConfig.'+pluginName, pluginConfig);
}

module.exports = editPlugin;
