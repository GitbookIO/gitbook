/* eslint-disable no-console */

var path = require('path');
var tinylr = require('tiny-lr');

var Promise = require('../utils/promise');
var PluginsManager = require('../plugins');
var Book = require('../book');
var NodeFS = require('../fs/node');

var helper = require('./helper');
var Server = require('./server');
var watch = require('./watch');

module.exports = {
    commands: [

        {
            name: 'parse [book]',
            description: 'parse and returns debug information for a book',
            options: [
                helper.options.log
            ],
            exec: helper.bookCmd(function(book) {
                return book.parse()
                .then(function() {
                    book.log.info.ln('');

                    if (book.config.exists()) book.log.info.ln('Configuration:', book.config.path);

                    if (book.isMultilingual()) {
                        book.log.info.ln('Multilingual book detected:', book.langs.path);
                    } else {
                        book.log.info.ln('Readme:', book.readme.path);
                        book.log.info.ln('Summary:', book.summary.path);
                        if (book.glossary.exists()) book.log.info.ln('Glossary:', book.glossary.path);
                    }
                });
            })
        },

        {
            name: 'install [book]',
            description: 'install all plugins dependencies',
            options: [
                helper.options.log
            ],
            exec: helper.bookCmd(function(book, args) {
                var plugins = new PluginsManager(book);
                return plugins.install();
            })
        },

        {
            name: 'build [book] [output]',
            description: 'build a book',
            options: [
                helper.options.log,
                helper.options.format
            ],
            exec: helper.outputCmd(function(output, args, kwargs) {
                return output.book.parse()
                .then(function() {
                    // Set output folder
                    if (args[0]) {
                        output.book.config.set('output', path.resolve(process.cwd(), args[0]));
                    }

                    return output.generate();
                });
            })
        },

        helper.ebookCmd('pdf'),
        helper.ebookCmd('epub'),
        helper.ebookCmd('mobi'),

        {
            name: 'serve [book]',
            description: 'Build then serve a book from a directory',
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
                helper.options.format,
                helper.options.log
            ],
            exec: function(args, kwargs) {
                var input = path.resolve(args[0] || process.cwd());
                var server = new Server();

                // Init livereload server
                var lrServer = tinylr({});
                var port = kwargs.port;
                var lrPath;

                var generate = function() {

                    // Stop server if running
                    if (server.isRunning()) console.log('Stopping server');
                    return server.stop()

                    // Generate the book
                    .then(function() {
                        return Book.setup(helper.nodeFS, input, {
                            'config': {
                                'defaultsPlugins': ['livereload']
                            },
                            'logLevel': kwargs.log
                        })
                        .then(function(book) {
                            return book.parse()
                            .then(function() {
                                var Out = helper.FORMATS[kwargs.format];
                                var output = new Out(book);

                                return output.generate()
                                .thenResolve(output);
                            });
                        });
                    })

                    // Start server and watch changes
                    .then(function(output) {
                        console.log();
                        console.log('Starting server ...');
                        return server.start(output.root(), port)
                        .then(function() {
                            console.log('Serving book on http://localhost:'+port);

                            if (lrPath) {
                                // trigger livereload
                                lrServer.changed({
                                    body: {
                                        files: [lrPath]
                                    }
                                });
                            }

                            if (!kwargs.watch) return;

                            return watch(output.book.root)
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

                return Promise.nfcall(lrServer.listen.bind(lrServer), kwargs.lrport)
                .then(function() {
                    console.log('Live reload server started on port:', kwargs.lrport);
                    console.log('Press CTRL+C to quit ...');
                    console.log('');
                    return generate();
                });
            }
        }

    ]
};
