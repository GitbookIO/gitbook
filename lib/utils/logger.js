var _ = require("lodash");
var util = require("util");
var color = require("bash-color");

var LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    DISABLED: 10
};

var COLORS = {
    DEBUG: color.purple,
    INFO: color.cyan,
    WARN: color.yellow,
    ERROR: color.red
};

module.exports = function(_write, logLevel) {
    var logger = {};
    var lastChar = "\n";
    if (_.isString(logLevel)) logLevel = LEVELS[logLevel.toUpperCase()];

    // Write a simple message
    logger.write = function(msg) {
        msg = msg.toString();
        lastChar = _.last(msg);
        return _write(msg);
    };

    // Format a message
    logger.format = function() {
        return util.format.apply(util, arguments);
    };

    // Write a line
    logger.writeLn = function(msg) {
        return this.write((msg || "")+"\n");
    };

    // Write a message with a certain level
    logger.log = function(level) {
        if (level < logLevel) return;

        var levelKey = _.findKey(LEVELS, function(v) { return v == level; });
        var args = Array.prototype.slice.apply(arguments, [1]);
        var msg = logger.format.apply(logger, args);

        if (lastChar == "\n") {
            msg = COLORS[levelKey](levelKey.toLowerCase()+":")+" "+msg;
        }

        return logger.write(msg);
    };
    logger.logLn = function() {
        if (lastChar != "\n") logger.write("\n");

        var args = Array.prototype.slice.apply(arguments);
        args.push("\n");
        logger.log.apply(logger, args);
    };

    // Write a OK
    logger.ok = function(level) {
        var args = Array.prototype.slice.apply(arguments, [1]);
        var msg = logger.format.apply(logger, args);
        if (arguments.length > 1) {
            logger.logLn(level, color.green(">> ") + msg.trim().replace(/\n/g, color.green("\n>> ")));
        } else {
            logger.log(level, color.green("OK"), "\n");
        }
    };

    // Write an "FAIL"
    logger.fail = function(level) {
        return logger.log(level, color.red("ERROR")+"\n");
    };

    _.each(_.omit(LEVELS, "DISABLED"), function(level, levelKey) {
        levelKey = levelKey.toLowerCase();

        logger[levelKey] = _.partial(logger.log, level);
        logger[levelKey].ln = _.partial(logger.logLn, level);
        logger[levelKey].ok = _.partial(logger.ok, level);
        logger[levelKey].fail = _.partial(logger.fail, level);
        logger[levelKey].promise = function(p) {
            return p.
            then(function(st) {
                logger[levelKey].ok();
                return st;
            }, function(err) {
                logger[levelKey].fail();
                throw err;
            });
        };
    });

    return logger;
};
module.exports.LEVELS = LEVELS;
module.exports.COLORS = COLORS;
