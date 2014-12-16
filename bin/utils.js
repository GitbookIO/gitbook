var Q = require('q');
var _ = require('lodash');

var exec = require('child_process').exec;
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

// exit wraps a promise
// and forcefully quits the program when the promise is resolved
function exit(promise) {
    promise
    .then(function() {
        // Prevent badly behaving plugins
        // from making the process hang
        process.exit(0);
    }, function(err) {
        // Log error
        logError(err);

        // Exit process with failure code
        process.exit(-1);
    });
}

// CLI action wrapper, calling exit when finished
function action(f) {
    return function() {
        // Call func and get optional promise
        var p = f.apply(null, arguments);

        // Exit process
        return exit(Q(p));
    }
}

function logError(err) {
    var message = err.message || err;
    if (process.env.DEBUG != null) message = err.stack || message;
    console.log(message);
    return Q.reject(err);
};

function runGitCommand(command, args) {
    var d = Q.defer(), child;
    args = ["git", command].concat(args).join(" ");

    child = exec(args, function (error, stdout, stderr) {
        if (error !== null) {
            error.stdout = stdout;
            error.stderr = stderr;
            d.reject(error);
        } else {
            d.resolve({
                stdout: stdout,
                stderr: stderr
            })
        }
    });

    return d.promise;
};


// Exports
module.exports = {
    exit: exit,
    action: action,
    watch: watch,
    logError: logError,
    gitCmd: runGitCommand
};
