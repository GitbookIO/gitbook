var Q = require("q");
var _ = require("lodash");

// Execute a method for all element
function execEach(items, options) {
    if (_.size(items) === 0) return Q();
    var concurrents = 0, d = Q.defer(), pending = [];

    options = _.defaults(options || {}, {
        max: 100,
        fn: function() {}
    });


    function startItem(item, i) {
        if (concurrents >= options.max) {
            pending.push([item, i]);
            return;
        }

        concurrents++;
        Q()
        .then(function() {
            return options.fn(item, i);
        })
        .then(function() {
            concurrents--;

            // Next pending
            var next = pending.shift();

            if (concurrents === 0 && !next) {
                d.resolve();
            } else if (next) {
                startItem.apply(null, next);
            }
        })
        .fail(function(err) {
            pending = [];
            d.reject(err);
        });
    }

    _.each(items, startItem);

    return d.promise;
}

module.exports = {
    execEach: execEach
};

