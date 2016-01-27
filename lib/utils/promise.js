var Q = require('q');
var _ = require('lodash');

// Reduce an array to a promise
function reduce(arr, iter, base) {
    return _.reduce(arr, function(prev, elem, i) {
        return prev.then(function(val) {
            return iter(val, elem, i);
        });
    }, Q(base));
}

// Transform an array
function serie(arr, iter, base) {
    return reduce(arr, function(before, item, i) {
        return Q(iter(item, i))
        .then(function(r) {
            before.push(r);
            return before;
        });
    }, []);
}

module.exports = Q;
module.exports.reduce = reduce;
module.exports.serie = serie;
