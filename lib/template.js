var _ = require("lodash");
var Q = require("q");
var nunjucks = require("nunjucks");

var pkg = require("../package.json");

var TemplateEngine = function(book) {
	this.book = book;

	// Nunjucks env
	this.env = new nunjucks.Environment(
		new nunjucks.FileSystemLoader(book.root),
		{
			// Escaping is done after by the markdown parser
			autoescape: false
		}
	);
};

// Render a file from the book
TemplateEngine.prototype.renderFile = function(filename) {
	var that = this;

	return that.book.statFile(filename)
	.then(function(stat) {
		var context = {
			// Variables from book.json
			book: that.book.options.variables,

			// infos about the file
			file: {
				path: filename,
				mtime: stat.mtime
			},

			// infos about gitbook
			gitbook: {
                version: pkg.version
            }
		};

		return Q.nfcall(that.env.render.bind(that.env), filename, context);
	});
};

module.exports = TemplateEngine;
