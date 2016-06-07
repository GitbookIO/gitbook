var _ = require('lodash');

module.exports = _.partialRight(_.merge, function recursiveDefaults () {
    // Ensure dates and arrays are not recursively merged
    if (_.isArray(arguments[0]) || _.isDate(arguments[0])) {
        return arguments[0];
    }

    return _.merge(arguments[0], arguments[1], recursiveDefaults);
});
