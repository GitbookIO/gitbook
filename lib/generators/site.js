var util = require("util");
var path = require("path");
var Q = require("q");
var _ = require("lodash");
var nunjucks = require("nunjucks");

var fs = require("../utils/fs");
var BaseGenerator = require("../generator");
var links = require("../utils/links");
var pageUtil = require("../utils/page");

var Generator = function() {
    BaseGenerator.apply(this, arguments);

    this.env = new nunjucks.Environment(
		new nunjucks.FileSystemLoader(book.root),
		{
			autoescape: true
		}
	);
};
util.inherits(Generator, BaseGenerator);

// Ignore some methods
Generator.prototype.transferFile = function(input) {

};


Generator.prototype.finish = function() {

};

// Convert an input file
Generator.prototype.writeParsedFile = function(page, input) {

};


Generator.prototype.langsIndex = function(langs) {

};

module.exports = Generator;
