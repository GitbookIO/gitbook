var Immutable = require('immutable');

/**
 *  Reduce the difference between a map and its default version
 *  @param {Map} defaultVersion
 *  @param {Map} currentVersion
 */
function reducedObject(defaultVersion, currentVersion) {
    return currentVersion.reduce(function(result, value, key) {
        var defaultValue = defaultVersion.get(key);

        if (Immutable.Map.isMap(value)) {
            var diffs = reducedObject(defaultValue, value);

            if (diffs.size > 0) {
                return result.set(key, diffs);
            }
        }

        if (Immutable.is(defaultValue, value)) {
            return result;
        }

        return result.set(key, value);
    }, Immutable.Map());
}

module.exports = reducedObject;
