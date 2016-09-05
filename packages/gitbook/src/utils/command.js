const is = require('is');
const childProcess = require('child_process');
const spawn = require('spawn-cmd').spawn;
const Promise = require('./promise');

/**
    Execute a command

    @param {String} command
    @param {Object} options
    @return {Promise}
*/
function exec(command, options) {
    const d = Promise.defer();

    const child = childProcess.exec(command, options, function(err, stdout, stderr) {
        if (!err) {
            return d.resolve();
        }

        err.message = stdout.toString('utf8') + stderr.toString('utf8');
        d.reject(err);
    });

    child.stdout.on('data', function(data) {
        d.notify(data);
    });

    child.stderr.on('data', function(data) {
        d.notify(data);
    });

    return d.promise;
}

/**
    Spawn an executable

    @param {String} command
    @param {Array} args
    @param {Object} options
    @return {Promise}
*/
function spawnCmd(command, args, options) {
    const d = Promise.defer();
    const child = spawn(command, args, options);

    child.on('error', function(error) {
        return d.reject(error);
    });

    child.stdout.on('data', function(data) {
        d.notify(data);
    });

    child.stderr.on('data', function(data) {
        d.notify(data);
    });

    child.on('close', function(code) {
        if (code === 0) {
            d.resolve();
        } else {
            d.reject(new Error('Error with command "' + command + '"'));
        }
    });

    return d.promise;
}

/**
    Transform an option object to a command line string

    @param {String|number} value
    @param {String}
*/
function escapeShellArg(value) {
    if (is.number(value)) {
        return value;
    }

    value = String(value);
    value = value.replace(/"/g, '\\"');

    return '"' + value + '"';
}

/**
    Transform a map of options into a command line arguments string

    @param {Object} options
    @return {String}
*/
function optionsToShellArgs(options) {
    const result = [];

    for (const key in options) {
        const value = options[key];

        if (value === null || value === undefined || value === false) {
            continue;
        }

        if (is.bool(value)) {
            result.push(key);
        } else {
            result.push(key + '=' + escapeShellArg(value));
        }
    }

    return result.join(' ');
}

module.exports = {
    exec,
    spawn: spawnCmd,
    optionsToShellArgs
};
