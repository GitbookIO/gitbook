const Immutable = require('immutable');

/**
 * Merge
 * @param  {Object|Map} obj
 * @param  {Object|Map} src
 * @return {Object}
 */
function mergeDefaults(obj, src) {
    const objValue = Immutable.fromJS(obj);
    const srcValue = Immutable.fromJS(src);

    return srcValue.mergeDeep(objValue).toJS();
}

module.exports = mergeDefaults;
