var BaseGenerator = require("./generator");
var util = require("util");

var Generator = function() {
    BaseGenerator.apply(this, arguments);
};
util.inherits(Generator, BaseGenerator);

Generator.prototype.convertFile = function(input) {
};

Generator.prototype.finish = function() {
};

module.exports = Generator;