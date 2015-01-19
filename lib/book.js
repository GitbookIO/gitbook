var _ = require("lodash");

var Configuration = require("./configuration");

var Book = function(root) {
	// Root folder of the book
	this.root = root;

	// Configuration
	this.config = new Configuration(this);
	Object.defineProperty(this, "options", {
		get: function () {
			return this.config.options;
		}
	});
};

module.exports= Book;
