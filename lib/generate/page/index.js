var util = require("util");
var path = require("path");
var Q = require("q");

var fs = require("../fs");
var parse = require("../../parse");
var BaseGenerator = require("../generator");


/*
 *  This generator will generate a simple index.html which can be converted as a PDF
 */
var Generator = function() {
    BaseGenerator.apply(this, arguments);
};
util.inherits(Generator, BaseGenerator);

Generator.prototype.transferFile = function(input) {
    // ignore
};

Generator.prototype.convertFile = function(content, input) {
    
};

Generator.prototype.finish = function() {
    // ignore
};

module.exports = Generator;