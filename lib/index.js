/* eslint no-console: 0 */

var Q = require('q');
var _ = require('lodash');
var path = require('path');
var tinylr = require('tiny-lr');
var color = require('bash-color');

var Book = require('./book');
var initBook = require('./init');
var Server = require('./utils/server');
var stringUtils = require('./utils/string');
var watch = require('./utils/watch');
var logger = require('./utils/logger');

var LOG_OPTION = {
    name: 'log',
    description: 'Minimum log level to display',
    values: _.chain(logger.LEVELS).keys().map(stringUtils.toLowerCase).value(),
    defaults: 'info'
};

var FORMAT_OPTION = {
    name: 'format',
    description: 'Format to build to',
    values: ['website', 'json', 'ebook'],
    defaults: 'website'
};

// Export init to gitbook library
Book.init = initBook;

module.exports = {
    Book: Book,
    LOG_LEVELS: logger.LEVELS,

    commands: _.flatten([
        {
            name: 'build [book] [output]',
            description: 'build a book',
            options: [
                FORMAT_OPTION,
                LOG_OPTION
            ],
            exec: function(args, kwargs) {
                var input = args[0] || process.cwd();
                var output = args[1] || path.join(input, '_book');

                var book = new Book(input, _.extend({}, {
                    'config': {
                        'output': output
                    },
                    'logLevel': kwargs.log
                }));

                return book.parse()
                .then(function() {
                    return book.generate(kwargs.format);
                })
                .then(function(){
                    console.log('');
                    console.log(color.green('Done, without error'));
                });
            }
        },

        _.map(['pdf', 'epub', 'mobi'], function(ebookType) {
            return {
                name: ebookType+' [book] [output]',
                description: 'build a book to '+ebookType,
                options: [
                    LOG_OPTION
                ],
                exec: function(args, kwargs) {
                    var input = args[0] || process.cwd();
                    var output = args[1];

                    var book = new Book(input, _.extend({}, {
                        'logLevel': kwargs.log
                    }));

                    return book.parse()
                    .then(function() {
                        return book.generateFile(output, {
                            ebookFormat: ebookType
                        });
                    })
                    .then(function(){
                        console.log('');
                        console.log(color.green('Done, without error'));
                    });
                }
            };
        }),

        {
            name: 'serve [book]',
            description: 'Build then serve a gitbook from a directory',
            options: [
                {
                    name: 'port',
                    description: 'Port for server to listen on',
                    defaults: 4000
                },
                {
                    name: 'lrport',
                    description: 'Port for livereload server to listen on',
                    defaults: 35729
                },
                {
                    name: 'watch',
                    description: 'Enable/disable file watcher',
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
                var lrPath;

                var generate = function() {
                    if (server.isRunning()) console.log('Stopping server');

                    return server.stop()
                    .then(function() {
                        var book = new Book(input, _.extend({}, {
                            'config': {
                                'defaultsPlugins': ['livereload']
                            },
                            'logLevel': kwargs.log
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
                                console.log('Restart after change in file', filepath);
                                console.log('');
                                return generate();
                            });
                        });
                    });
                };

                return Q.nfcall(lrServer.listen.bind(lrServer), kwargs.lrport)
                .then(function() {
                    console.log('Live reload server started on port:', kwargs.lrport);
                    console.log('Press CTRL+C to quit ...');
                    console.log('');
                    return generate();
                });
            }
        },

        {
            name: 'install [book]',
            description: 'install plugins dependencies',
            exec: function(args) {
                var input = args[0] || process.cwd();

                var book = new Book(input);

                return book.config.load()
                .then(function() {
                    return book.plugins.install();
                })
                .then(function(){
                    console.log('');
                    console.log(color.green('Done, without error'));
                });
            }
        },

        {
            name: 'init [directory]',
            description: 'create files and folders based on contents of SUMMARY.md',
            exec: function(args) {
                return initBook(args[0] || process.cwd())
                .then(function(){
                    console.log('');
                    console.log(color.green('Done, without error'));
                });
            }
        }
    ])
};
