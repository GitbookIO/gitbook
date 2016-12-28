
/**
 * Return list of plugin names. This method is only used in unit tests.
 *
 * @param {OrderedMap<String:Plugin} plugins
 * @return {Array<String>}
 */
function toNames(plugins) {
    return plugins
        .map((plugin) => {
            return plugin.getName();
        })
        .toArray();
}

module.exports = toNames;
