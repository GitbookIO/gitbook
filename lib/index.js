var Q = require("q");
var _ = require("lodash");
var path = require("path");
var tinylr = require('tiny-lr-fork');

var Book = require("./book");
var Plugin = require("./plugin");
var Server = require("./utils/server");
var stringUtils = require("./utils/string");
var watch = require("./utils/watch");

var LOG_OPTION = {
	name: "log",
	description: "Minimum log level to display",
	values: _.chain(Book.LOG_LEVELS).keys().map(stringUtils.toLowerCase).value(),
	defaults: "info"
};

var FORMAT_OPTION = {
	name: "format",
	description: "Format to build to",
	values: ["website", "json", "ebook"],
	defaults: "website"
};

module.exports = {
	Book: Book,

	commands: [
		// Build command that simply build a book into an output folder
		{
			name: "build [book] [output]",
			description: "build a book",
			options: [
				FORMAT_OPTION,
				LOG_OPTION
			],
			exec: function(args, kwargs) {
				var input = args[0] || process.cwd();
				var output = args[1] || path.join(input, "_book");

				var book = new Book(input, _.extend({}, {
					'config': {
						'output': output
					},
					'logLevel': Book.LOG_LEVELS[(kwargs.log).toUpperCase()]
				}));

				return book.parse()
				.then(function() {
					return book.generate(kwargs.format);
				});
			}
		},

		// Build  an ebook and output it
		{
			name: "pdf [book] [output]",
			description: "build a book to pdf",
			options: [
				LOG_OPTION
			],
			exec: function(args, kwargs) {
				var input = args[0] || process.cwd();
				var output = args[1];

				var book = new Book(input, _.extend({}, {
					'logLevel': Book.LOG_LEVELS[(kwargs.log).toUpperCase()]
				}));

				return book.parse()
				.then(function() {
					return book.generateFile(output, {
						ebookFormat: "pdf"
					});
				});
			}
		},

		// Build and serve a book
		{
			name: "serve [book]",
			description: "Build then serve a gitbook from a directory",
			options: [
				{
					name: "port",
					description: "Port for server to listen on",
					defaults: 4000
				},
				{
					name: "lrport",
					description: "Port for livereload server to listen on",
					defaults: 35729
				},
				{
					name: "watch",
					description: "Enable/disable file watcher",
					defaults: true
				},
				FORMAT_OPTION,
				LOG_OPTION
			],
			exec: function(args, kwargs) {
				var input = args[0] || process.cwd();
				var server = new Server();

				// Init livereload server
				var lrServer = tinylr({});
				var lrPath = undefined;

				var generate = function() {
			        if (server.isRunning()) console.log("Stopping server");

			        return server.stop()
			        .then(function() {
			        	var book = new Book(input, _.extend({}, {
							'config': {
								'defaultsPlugins': ["livereload"]
							},
							'logLevel': Book.LOG_LEVELS[(kwargs.log).toUpperCase()]
						}));

						return book.parse()
						.then(function() {
							return book.generate(kwargs.format);
						})
						.thenResolve(book);
			        })
			        .then(function(book) {
			            console.log();
			            console.log('Starting server ...');
			            return server.start(book.options.output, kwargs.port)
			            .then(function() {
			                console.log('Serving book on http://localhost:'+kwargs.port);

			                if (lrPath) {
			                	// trigger livereload
			                	lrServer.changed({
			                		body: {
			                			files: [lrPath]
			                		}
			                	});
			                }

			                if (!kwargs.watch) return;

			                return watch(book.root)
			                .then(function(filepath) {
			                    // set livereload path
			                    lrPath = filepath;
			                    console.log("Restart after change in files");
			                    console.log('');
			                    return generate();
			                })
			            })
			        });
			    };

				return Q.nfcall(lrServer.listen.bind(lrServer), kwargs.lrport)
				.then(function() {
					console.log('Live reload server started on port:', kwargs.lrport);
					console.log('Press CTRL+C to quit ...');
    				console.log('')
					return generate();
				});
			}
		},

		// Install command that install plugins needed by a book
		{
			name: "install [book]",
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
