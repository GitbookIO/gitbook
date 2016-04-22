var Q = require('q');
var Immutable = require('immutable');

/**
    Reduce an array to a promise

    @param {Array|List} arr
    @param {Function(value, element, index)}
    @return {Promise<Mixed>}
*/
function reduce(arr, iter, base) {
    arr = Immutable.List(arr);

    return arr.reduce(function(prev, elem, i) {
        return prev.then(function(val) {
            return iter(val, elem, i);
        });
    }, Q(base));
}

/**
    Iterate over an array using an async iter

    @param {Array|List} arr
    @param {Function(value, element, index)}
    @return {Promise}
*/
function forEach(arr, iter) {
    return reduce(arr, function(val, el) {
        return iter(el);
    });
}

/**
    Transform an array

    @param {Array|List} arr
    @param {Function(value, element, index)}
    @return {Promise}
*/
function serie(arr, iter, base) {
    return reduce(arr, function(before, item, i) {
        return Q(iter(item, i))
        .then(function(r) {
            before.push(r);
            return before;
        });
    }, []);
}

/**
    Iter over an array and return first result (not null)

    @param {Array|List} arr
    @param {Function(element, index)}
    @return {Promise<Mixed>}
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
    Map an array using an async (promised) iterator

    @param {Array|List} arr
    @param {Function(element, index)}
    @return {Promise<List>}
*/
function map(arr, iter) {
    return reduce(arr, function(prev, entry, i) {
        return Q(iter(entry, i))
        .then(function(out) {
            prev.push(out);
            return prev;
        });
    }, []);
}

/**
    Wrap a fucntion in a promise

    @param {Function} func
    @return {Funciton}
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
