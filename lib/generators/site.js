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

    // Style to integrates i nthe output
    this.styles = ["website"];

    // base folder for templates
    this.templatesRoot = path.resolve(__dirname, "../../theme/templates/website")
};
util.inherits(Generator, BaseGenerator);

// Prepare the genertor
BaseGenerator.prototype.load = function() {
    var that = this;

    return BaseGenerator.prototype.load.apply(this)
    .then(function() {
        return that.loadTemplates();
    });
};

// Load all styles
Generator.prototype.loadStyles = function() {
    var that = this;
    this.styles = _.chain(this.styles)
        .map(function(style) {
            var stylePath = that.options.styles[style];
            if (fs.existsSync(path.resolve(that.book.root, stylePath))) {
                return stylePath;
            }
            return null;
        })
        .compact()
        .value();
};

// Load template engine
Generator.prototype.loadTemplates = function() {
	this.env = new nunjucks.Environment(
		new nunjucks.FileSystemLoader(this.templatesRoot),
		{
			autoescape: true
		}
	);

	return Q();
};

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
