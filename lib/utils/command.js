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

module.exports = {
    isAvailable: isAvailable,
    exec: exec
};
