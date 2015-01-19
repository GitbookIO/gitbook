var Q = require("q");
var _ = require("lodash");
var path = require("path");

var Book = require("./book");

module.exports = {
	Book: Book,

	commands: [
		{
			name: "build",
			description: "Build a book",
			exec: function(args, kwargs) {
				var input = args[0] || process.cwd();
				var output = args[1] || path.join(input, "_book");

				var book = new Book(input, _.extend({}, {
					'output': output
				}));

				return book.parse()
				.then(function() {
					return book.generate();
				});
			}
		}
	]
};
