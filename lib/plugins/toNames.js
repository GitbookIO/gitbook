
/**
 * Return list of plugin names. This method is nly used in unit tests.
 *
 * @param {OrderedMap<String:Plugin} plugins
 * @return {Array<String>}
 */
function toNames(plugins) {
    return plugins
        .map(function(plugin) {
            return plugin.getName();
        })
        .toArray();
}

module.exports = toNames;
