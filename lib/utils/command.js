var childProcess = require('child_process');
var Promise = require('./promise');

// On borwser, command execution is not possible
var isAvailable = childProcess && childProcess.exec;

// Execute a command
function exec(command, options) {
    if (!isAvailable) {
        return Promise.reject(new Error('Command execution is not possible on this platform'));
    }

    return Promise.nfcall(childProcess.exec, command, options);
}

// Spawn an executable
function spawn(command, args, options) {
    if (!isAvailable) {
        return Promise.reject(new Error('Command execution is not possible on this platform'));
    }

    var d = Promise.deferred();
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

module.exports = {
    isAvailable: isAvailable,
    exec: exec,
    spawn: spawn
};
