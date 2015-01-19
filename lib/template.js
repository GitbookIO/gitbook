var _ = require("lodash");
var nunjucks = require("nunjucks");

var TemplateEngine = function(book) {
	this.book = book;
};

// Render a file from the book
TemplateEngine.prototype.renderFile = function(filename) {
	var that = this;

	return this.book.readFile(filename)
	.then(function(content) {

	});
};

module.exports = TemplateEngine;
