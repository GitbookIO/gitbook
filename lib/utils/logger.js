var _ = require('lodash');
var util = require('util');
var color = require('bash-color');

var LEVELS = {
	DEBUG: 0,
	INFO: 1,
	WARNING: 2,
	ERROR: 3
};

var COLORS = {
	DEBUG: color.purple,
	INFO: color.cyan,
	WARNING: color.yellow,
	ERROR: color.red
};

module.exports = function(_write, logLevel) {
	var logger = {};
	var lastChar = '\n';
	if (_.isString(logLevel)) logLevel = LEVELS[logLevel.toUpperCase()];

	// Write a simple message
	logger.write = function(msg) {
		msg = msg.toString();
		lastChar = _.last(msg);
		return _write(msg);
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
		var msg = util.format.apply(util, args);

		if (lastChar == '\n') {
			msg = COLORS[levelKey](levelKey.toLowerCase()+":")+" "+msg;
		}

		return logger.write(msg);
	};

	// Write a OK
	logger.ok = function(level) {
		return logger.log(level, color.green("OK")+"\n");
	};

	// Write an "FAIL"
	logger.fail = function(level) {
		return logger.log(level, color.red("ERROR")+"\n");
	};

	_.each(LEVELS, function(level, levelKey) {
		levelKey = levelKey.toLowerCase();

		logger[levelKey] = _.partial(logger.log, level);
		logger[levelKey].ln = function() {
			var args = Array.prototype.slice.apply(arguments);
			args.push("\n");
			logger[levelKey].apply(logger, args);
		};
		logger[levelKey].ok = _.partial(logger.ok, level);
		logger[levelKey].fail = _.partial(logger.fail, level);
	});

	return logger;
};
module.exports.LEVELS = LEVELS;
module.exports.COLORS = COLORS;
