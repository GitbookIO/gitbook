var PluginDependency = require('../../models/pluginDependency');
/**
    Add a plugin to a book's configuration

    @param {Book} book
    @param {String} plugin
    @param {String} version (optional)
    @return {Book}
*/
function addPlugin(book, plugin, version) {
    var config = book.getConfig();
    var deps = config.getPluginDependencies();

    var dep = PluginDependency.create(plugin, version);

    deps = deps.push(dep);
    config = config.setPluginDependencies(deps);

    return book.setConfig(config);
}

module.exports = addPlugin;
