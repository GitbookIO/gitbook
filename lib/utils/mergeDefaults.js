var _ = require('lodash');

function customizer(objValue, srcValue) {
    // Ensure dates and arrays are not recursively merged
    if (!_.isObject(objValue)) {
        return objValue;
    }

    return mergeDefaults(objValue, srcValue);
}

var mergeDefaults = _.partialRight(_.mergeWith, customizer);

module.exports = mergeDefaults;
