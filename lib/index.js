var Q = require("q");
var _ = require("lodash");
var path = require("path");

var Book = require("./book");
var Plugin = require("./plugin");

module.exports = {
	Book: Book,

	commands: [
		// Build command that simply build a book into an output folder
		{
			name: "build",
			description: "build a book",
			exec: function(args, kwargs) {
				var input = args[0] || process.cwd();
				var output = args[1] || path.join(input, "_book");
				kwargs = _.defaults(kwargs || {}, {
					format: "website"
				});

				var book = new Book(input, _.extend({}, {
					'config': {
						'output': output
					},
					'logLevel': Book.LOG_LEVELS[(kwargs.log || "info").toUpperCase()]
				}));

				return book.parse()
				.then(function() {
					return book.generate(kwargs.format);
				});
			}
		},

		// Install command that install plugins needed by a book
		{
			name: "install",
			description: "install plugins dependencies",
			exec: function(args, kwargs) {
				var input = args[0] || process.cwd();

				var book = new Book(input);

				return book.config.load()
				.then(function() {
					return book.config.installPlugins({
						log: true
					});
				});
			}
		}
	]
};
