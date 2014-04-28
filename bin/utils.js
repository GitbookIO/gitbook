var Q = require('q');
var _ = require('lodash');

var http = require('http');
var send = require('send');

var path = require('path');
var Gaze = require('gaze').Gaze;

function watch(dir) {
    var d = Q.defer();
    dir = path.resolve(dir);

    var gaze = new Gaze("**/*.md", {
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

function logError(err) {
    console.log(err.stack || err.message || err);
    return Q.reject(err);
};


// Exports
module.exports = {
    watch: watch,
    logError: logError
};
