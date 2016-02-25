var _ = require('lodash');
var childProcess = require('child_process');
var Promise = require('./promise');

// On borwser, command execution is not possible
var isAvailable = childProcess && childProcess.exec;

// Execute a command
function exec(command, options) {
    if (!isAvailable) {
        return Promise.reject(new Error('Command execution is not possible on this platform'));
    }

    var d = Promise.defer();

    var child = childProcess.exec(command, options, function(err, stdout, stderr) {
        if (!err) {
            return d.resolve();
        }

        err.message = stdout.toString('utf8') + stderr.toString('utf8');
        d.reject(err);
    });

    child.stdout.on('data', function (data) {
        d.notify(data);
    });

    child.stderr.on('data', function (data) {
        d.notify(data);
    });

    return d.promise;
}

// Spawn an executable
function spawn(command, args, options) {
    if (!isAvailable) {
        return Promise.reject(new Error('Command execution is not possible on this platform'));
    }

    var d = Promise.defer();
    var child = childProcess.spawn(command, args, options);

    child.on('error', function(error) {
        return d.reject(error);
    });

    child.on('close', function(code) {
        if (code === 0) {
            d.resolve();
        } else {
            d.reject(new Error('Error with command "'+command+'"'));
        }
    });

    return d.promise;
}

// Transform an option object to a command line string
function escapeShellArg(s) {
    s = s.replace(/"/g, '\\"');
    return '"' + s + '"';
}

function optionsToShellArgs(options) {
    return _.chain(options)
    .map(function(value, key) {
        if (value === null || value === undefined || value === false) return null;
        if (value === true) return key;
        return key + '=' + escapeShellArg(value);
    })
    .compact()
    .value()
    .join(' ');
}

module.exports = {
    isAvailable: isAvailable,
    exec: exec,
    spawn: spawn,
    optionsToShellArgs: optionsToShellArgs
};
