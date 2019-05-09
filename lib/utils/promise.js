var Q = require('q');
var Immutable = require('immutable');

// Debugging for long stack traces
if (process.env.DEBUG || process.env.CI) {
    Q.longStackSupport = true;
}

/**
 * Reduce an array to a promise
 *
 * @param {Array|List} arr
 * @param {Function(value, element, index)}
 * @return {Promise<Mixed>}
 */
function reduce(arr, iter, base) {
    arr = Immutable.Iterable.isIterable(arr)? arr : Immutable.List(arr);

    return arr.reduce(function(prev, elem, key) {
        return prev
        .then(function(val) {
            return iter(val, elem, key);
        });
    }, Q(base));
}

/**
 * Iterate over an array using an async iter
 *
 * @param {Array|List} arr
 * @param {Function(value, element, index)}
 * @return {Promise}
 */
function forEach(arr, iter) {
    return reduce(arr, function(val, el, key) {
        return iter(el, key);
    });
}

/**
 * Transform an array
 *
 * @param {Array|List} arr
 * @param {Function(value, element, index)}
 * @return {Promise}
 */
function serie(arr, iter, base) {
    return reduce(arr, function(before, item, key) {
        return Q(iter(item, key))
        .then(function(r) {
            before.push(r);
            return before;
        });
    }, []);
}

/**
 * Iter over an array and return first result (not null)
 *
 * @param {Array|List} arr
 * @param {Function(element, index)}
 * @return {Promise<Mixed>}
 */
function some(arr, iter) {
    arr = Immutable.List(arr);

    return arr.reduce(function(prev, elem, i) {
        return prev.then(function(val) {
            if (val) return val;

            return iter(elem, i);
        });
    }, Q());
}

/**
 * Map an array using an async (promised) iterator
 *
 * @param {Array|List} arr
 * @param {Function(element, index)}
 * @return {Promise<List>}
 */
function mapAsList(arr, iter) {
    return reduce(arr, function(prev, entry, i) {
        return Q(iter(entry, i))
        .then(function(out) {
            prev.push(out);
            return prev;
        });
    }, []);
}

/**
 * Map an array or map
 *
 * @param {Array|List|Map|OrderedMap} arr
 * @param {Function(element, key)}
 * @return {Promise<List|Map|OrderedMap>}
 */
function map(arr, iter) {
    if (Immutable.Map.isMap(arr)) {
        var type = 'Map';
        if (Immutable.OrderedMap.isOrderedMap(arr)) {
            type = 'OrderedMap';
        }

        return mapAsList(arr, function(value, key) {
            return Q(iter(value, key))
            .then(function(result) {
                return [key, result];
            });
        })
        .then(function(result) {
            return Immutable[type](result);
        });
    } else {
        return mapAsList(arr, iter)
        .then(function(result) {
            return Immutable.List(result);
        });
    }
}


/**
 * Wrap a function in a promise
 *
 * @param {Function} func
 * @return {Funciton}
 */
function wrap(func) {
    return function() {
        var args = Array.prototype.slice.call(arguments, 0);

        return Q()
        .then(function() {
            return func.apply(null, args);
        });
    };
}

module.exports = Q;
module.exports.forEach = forEach;
module.exports.reduce = reduce;
module.exports.map = map;
module.exports.serie = serie;
module.exports.some = some;
module.exports.wrapfn = wrap;
