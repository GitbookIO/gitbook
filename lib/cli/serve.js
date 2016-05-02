/* eslint-disable no-console */

var tinylr = require('tiny-lr');

var Parse = require('../parse');
var Output = require('../output');
var ConfigModifier = require('../modifiers').Config;

var Promise = require('../utils/promise');

var options = require('./options');
var getBook = require('./getBook');
var getOutputFolder = require('./getOutputFolder');
var Server = require('./server');
var watch = require('./watch');

var server, lrServer, lrPath;

function generateBook(args, kwargs) {
    var port = kwargs.port;
    var outputFolder = getOutputFolder(args);
    var book = getBook(args, kwargs);
    var Generator = Output.getGenerator(kwargs.format);

    // Stop server if running
    if (server.isRunning()) console.log('Stopping server');

    return server.stop()
    .then(function() {
        return Parse.parseBook(book)
        .then(function(resultBook) {
            // Enable livereload plugin
            resultBook = ConfigModifier.addPlugin(resultBook, 'livereload');

            return Output.generate(Generator, resultBook, {
                root: outputFolder
            });
        });
    })
    .then(function() {
        console.log();
        console.log('Starting server ...');
        return server.start(outputFolder, port);
    })
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
    })
    .then(function() {
        if (!kwargs.watch) return;

        return watch(book.getRoot())
        .then(function(filepath) {
            // set livereload path
            lrPath = filepath;
            console.log('Restart after change in file', filepath);
            console.log('');
            return generateBook(args, kwargs);
        });
    });
}

module.exports = {
    name: 'serve [book] [output]',
    description: 'serve the book as a website for testing',
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
        options.log,
        options.format
    ],
    exec: function(args, kwargs) {
        server = new Server();
        lrServer = tinylr({});

        return Promise.nfcall(lrServer.listen.bind(lrServer), kwargs.lrport)
        .then(function() {
            console.log('Live reload server started on port:', kwargs.lrport);
            console.log('Press CTRL+C to quit ...');
            console.log('');
            return generateBook(args, kwargs);
        });
    }
};
