const is = require('is');
const util = require('util');
const color = require('bash-color');
const Immutable = require('immutable');

const LEVELS = Immutable.Map({
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    DISABLED: 10
});

const COLORS = Immutable.Map({
    DEBUG: color.purple,
    INFO: color.cyan,
    WARN: color.yellow,
    ERROR: color.red
});

function Logger(write, logLevel) {
    if (!(this instanceof Logger)) return new Logger(write, logLevel);

    this._write = write || function(msg) {
        if (process.stdout) {
            process.stdout.write(msg);
        }
    };
    this.lastChar = '\n';

    this.setLevel(logLevel || 'info');

    // Create easy-to-use method like "logger.debug.ln('....')"
    LEVELS.forEach(function(level, levelKey) {
        if (levelKey === 'DISABLED') {
            return;
        }
        levelKey = levelKey.toLowerCase();

        this[levelKey] =            this.log.bind(this, level);
        this[levelKey].ln =         this.logLn.bind(this, level);
        this[levelKey].ok =         this.ok.bind(this, level);
        this[levelKey].fail =       this.fail.bind(this, level);
        this[levelKey].promise =    this.promise.bind(this, level);
    }, this);
}

/**
    Change minimum level

    @param {String} logLevel
*/
Logger.prototype.setLevel = function(logLevel) {
    if (is.string(logLevel)) {
        logLevel = logLevel.toUpperCase();
        logLevel = LEVELS.get(logLevel);
    }

    this.logLevel = logLevel;
};

/**
    Return minimum logging level

    @return {Number}
*/
Logger.prototype.getLevel = function(logLevel) {
    return this.logLevel;
};

/**
    Print a simple string

    @param {String}
*/
Logger.prototype.write = function(msg) {
    msg = msg.toString();
    this.lastChar = msg[msg.length - 1];
    return this._write(msg);
};

/**
    Format a string using the first argument as a printf-like format.
*/
Logger.prototype.format = function(...args) {
    return util.format(...args);
};

/**
    Print a line

    @param {String}
*/
Logger.prototype.writeLn = function(msg) {
    return this.write((msg || '') + '\n');
};

/**
    Log/Print a message if level is allowed

    @param {Number} level
*/
Logger.prototype.log = function(level, ...args) {
    if (level < this.logLevel) return;

    const levelKey = LEVELS.findKey((v) => {
        return v === level;
    });
    let msg = this.format(...args);

    if (this.lastChar == '\n') {
        msg = COLORS.get(levelKey)(levelKey.toLowerCase() + ':') + ' ' + msg;
    }

    return this.write(msg);
};

/**
    Log/Print a line if level is allowed
*/
Logger.prototype.logLn = function(...args) {
    if (this.lastChar != '\n') this.write('\n');

    args.push('\n');
    return this.log(...args);
};

/**
    Log a confirmation [OK]
*/
Logger.prototype.ok = function(level, ...args) {
    const msg = this.format(...args);

    if (args.length > 0) {
        this.logLn(level, color.green('>> ') + msg.trim().replace(/\n/g, color.green('\n>> ')));
    } else {
        this.log(level, color.green('OK'), '\n');
    }
};

/**
    Log a "FAIL"
*/
Logger.prototype.fail = function(level) {
    return this.log(level, color.red('ERROR') + '\n');
};

/**
    Log state of a promise

    @param {Number} level
    @param {Promise}
    @return {Promise}
*/
Logger.prototype.promise = function(level, p) {
    const that = this;

    return p
    .then((st) => {
        that.ok(level);
        return st;
    }, (err) => {
        that.fail(level);
        throw err;
    });
};

Logger.LEVELS = LEVELS;

module.exports =  Logger;
