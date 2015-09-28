var Q = require("q");
var _ = require("lodash");
var path = require("path");
var chokidar = require("chokidar");

var parsers = require("gitbook-parsers");

function watch(dir) {
    var d = Q.defer();
    dir = path.resolve(dir);

    var toWatch = [
        "book.json", "book.js"
    ];

    _.each(parsers.extensions, function(ext) {
        toWatch.push("**/*"+ext);
    });

    var watcher = chokidar.watch(toWatch, {
        cwd: dir,
        ignored: "_book/**",
        ignoreInitial: true
    });

    watcher.once("all", function(e, filepath) {
        watcher.close();

        d.resolve(filepath);
    });
    watcher.once("error", function(err) {
        watcher.close();

        d.reject(err);
    });

    return d.promise;
}

module.exports = watch;
