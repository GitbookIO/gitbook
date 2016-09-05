const is        = require('is');
const Immutable = require('immutable');
const Promise   = require('../../utils/promise');

const Api              = require('../../api');

/**
    Prepare plugins resources, add all output corresponding type resources

    @param {Output}
    @return {Promise<Output>}
*/
function prepareResources(output) {
    const plugins = output.getPlugins();
    const options = output.getOptions();
    const type    = options.get('prefix');
    let state   = output.getState();
    const context = Api.encodeGlobal(output);

    let result = Immutable.Map();

    return Promise.forEach(plugins, function(plugin) {
        const pluginResources = plugin.getResources(type);

        return Promise()
        .then(function() {
            // Apply resources if is a function
            if (is.fn(pluginResources)) {
                return Promise()
                .then(pluginResources.bind(context));
            }
            else {
                return pluginResources;
            }
        })
        .then(function(resources) {
            result = result.set(plugin.getName(), Immutable.Map(resources));
        });
    })
    .then(function() {
        // Set output resources
        state = state.merge({
            resources: result
        });

        output = output.merge({
            state
        });

        return output;
    });
}

module.exports = prepareResources;
