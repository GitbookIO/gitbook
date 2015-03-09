var Q = require('q');
var _ = require('lodash');
var path = require('path');
var Gaze = require('gaze').Gaze;

var parsers = require('gitbook-parsers')

function watch(dir) {
    var d = Q.defer();
    dir = path.resolve(dir);

    var toWatch = [
        "book.json", "book.js"
    ];

    _.each(parsers.extensions, function(ext) {
        toWatch.push("**/*"+ext);
    });

    var gaze = new Gaze(toWatch, {
        cwd: dir
    });

    gaze.once("all", function(e, filepath) {
        gaze.close();

        d.resolve(filepath);
    });
    gaze.once("error", function(err) {
        gaze.close();

        d.reject(err);
    });

    return d.promise;
}

module.exports = watch;
