
/**
    List search paths for templates / i18n, etc

    @param {Output} output
    @return {List<String>}
*/
function listSearchPaths(output) {
    var book = output.getBook();
    var plugins = output.getPlugins();

    var searchPaths = plugins
        .valueSeq()
        .map(function(plugin) {
            return plugin.getPath();
        })
        .toList();

    return searchPaths.unshift(book.getContentRoot());
}


module.exports = listSearchPaths;
