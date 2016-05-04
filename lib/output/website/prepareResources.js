var is        = require('is');
var Immutable = require('immutable');
var Promise   = require('../../utils/promise');

var Api              = require('../../api');

/**
    Prepare plugins resources, add all output corresponding type resources

    @param {Output}
    @return {Promise<Output>}
*/
function prepareResources(output) {
    var plugins = output.getPlugins();
    var options = output.getOptions();
    var type    = options.get('prefix');
    var state   = output.getState();
    var context = Api.encodeGlobal(output);

    var result = Immutable.Map();

    return Promise.forEach(plugins, function(plugin) {
        var pluginResources = plugin.getResources(type);

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
            state: state
        });

        return output;
    });
}

module.exports = prepareResources;