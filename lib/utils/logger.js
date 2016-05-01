var is = require('is');
var util = require('util');
var color = require('bash-color');
var Immutable = require('immutable');

var LEVELS = Immutable.Map({
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    DISABLED: 10
});

var COLORS = Immutable.Map({
    DEBUG: color.purple,
    INFO: color.cyan,
    WARN: color.yellow,
    ERROR: color.red
});

function Logger(write, logLevel) {
    if (!(this instanceof Logger)) return new Logger(write, logLevel);

    this._write = write || function(msg) {
        if(process.stdout) {
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
Logger.prototype.format = function() {
    return util.format.apply(util, arguments);
};

/**
    Print a line

    @param {String}
*/
Logger.prototype.writeLn = function(msg) {
    return this.write((msg || '')+'\n');
};

/**
    Log/Print a message if level is allowed

    @param {Number} level
*/
Logger.prototype.log = function(level) {
    if (level < this.logLevel) return;

    var levelKey = LEVELS.findKey(function(v) {
        return v === level;
    });
    var args = Array.prototype.slice.apply(arguments, [1]);
    var msg = this.format.apply(this, args);

    if (this.lastChar == '\n') {
        msg = COLORS.get(levelKey)(levelKey.toLowerCase()+':')+' '+msg;
    }

    return this.write(msg);
};

/**
    Log/Print a line if level is allowed
*/
Logger.prototype.logLn = function() {
    if (this.lastChar != '\n') this.write('\n');

    var args = Array.prototype.slice.apply(arguments);
    args.push('\n');
    return this.log.apply(this, args);
};

/**
    Log a confirmation [OK]
*/
Logger.prototype.ok = function(level) {
    var args = Array.prototype.slice.apply(arguments, [1]);
    var msg = this.format.apply(this, args);
    if (arguments.length > 1) {
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
    var that = this;

    return p.
    then(function(st) {
        that.ok(level);
        return st;
    }, function(err) {
        that.fail(level);
        throw err;
    });
};

Logger.LEVELS = LEVELS;

module.exports =  Logger;
