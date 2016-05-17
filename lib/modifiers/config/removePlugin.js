
/**
    Remove a plugin from a book's configuration

    @param {Book} book
    @param {String} plugin
    @return {Book}
*/
function removePlugin(book, pluginName) {
    var config = book.getConfig();
    var deps = config.getPluginDependencies();


    deps = deps.filter(function(dep) {
        return dep.getName() === pluginName;
    });
    config = config.setPluginDependencies(deps);

    return book.setConfig(config);
}

module.exports = removePlugin;
