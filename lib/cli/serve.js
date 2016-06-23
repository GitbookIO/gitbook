/* eslint-disable no-console */

var tinylr = require('tiny-lr');
var open = require('open');

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

function waitForCtrlC() {
    var d = Promise.defer();

    process.on('SIGINT', function() {
        d.resolve();
    });

    return d.promise;
}


function generateBook(args, kwargs) {
    var port = kwargs.port;
    var outputFolder = getOutputFolder(args);
    var book = getBook(args, kwargs);
    var Generator = Output.getGenerator(kwargs.format);
    var browser = kwargs['browser'];

    var hasWatch = kwargs['watch'];
    var hasLiveReloading = kwargs['live'];
    var hasOpen = kwargs['open'];

    // Stop server if running
    if (server.isRunning()) console.log('Stopping server');

    return server.stop()
    .then(function() {
        return Parse.parseBook(book)
        .then(function(resultBook) {
            if (hasLiveReloading) {
                // Enable livereload plugin
                var config = resultBook.getConfig();
                config = ConfigModifier.addPlugin(config, 'livereload');
                resultBook = resultBook.set('config', config);
            }

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

        if (lrPath && hasLiveReloading) {
            // trigger livereload
            lrServer.changed({
                body: {
                    files: [lrPath]
                }
            });
        }

        if (hasOpen) {
            open('http://localhost:'+port, browser);
        }
    })
    .then(function() {
        if (!hasWatch) {
            return waitForCtrlC();
        }

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
            description: 'Enable file watcher and live reloading',
            defaults: true
        },
        {
            name: 'live',
            description: 'Enable live reloading',
            defaults: true
        },
        {
            name: 'open',
            description: 'Enable opening book in browser',
            defaults: false
        },
        {
            name: 'browser',
            description: 'Specify browser for opening book',
            defaults: ''
        },
        options.log,
        options.format
    ],
    exec: function(args, kwargs) {
        server = new Server();
        var hasWatch = kwargs['watch'];
        var hasLiveReloading = kwargs['live'];

        return Promise()
        .then(function() {
            if (!hasWatch || !hasLiveReloading) {
                return;
            }

            lrServer = tinylr({});
            return Promise.nfcall(lrServer.listen.bind(lrServer), kwargs.lrport)
            .then(function() {
                console.log('Live reload server started on port:', kwargs.lrport);
                console.log('Press CTRL+C to quit ...');
                console.log('');

            });
        })
        .then(function() {
            return generateBook(args, kwargs);
        });
    }
};
