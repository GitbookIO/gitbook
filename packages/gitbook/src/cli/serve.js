/* eslint-disable no-console */

const tinylr = require('tiny-lr');
const open = require('open');

const Parse = require('../parse');
const Output = require('../output');
const ConfigModifier = require('../modifiers').Config;

const Promise = require('../utils/promise');

const options = require('./options');
const getBook = require('./getBook');
const getOutputFolder = require('./getOutputFolder');
const Server = require('./server');
const watch = require('./watch');

let server, lrServer, lrPath;

function waitForCtrlC() {
    const d = Promise.defer();

    process.on('SIGINT', () => {
        d.resolve();
    });

    return d.promise;
}


function generateBook(args, kwargs) {
    const port = kwargs.port;
    const outputFolder = getOutputFolder(args);
    const book = getBook(args, kwargs);
    const Generator = Output.getGenerator(kwargs.format);
    const browser = kwargs['browser'];

    const hasWatch = kwargs['watch'];
    const hasLiveReloading = kwargs['live'];
    const hasOpen = kwargs['open'];

    // Stop server if running
    if (server.isRunning()) console.log('Stopping server');

    return server.stop()
    .then(() => {
        return Parse.parseBook(book)
        .then((resultBook) => {
            if (hasLiveReloading) {
                // Enable livereload plugin
                let config = resultBook.getConfig();
                config = ConfigModifier.addPlugin(config, 'livereload');
                resultBook = resultBook.set('config', config);
            }

            return Output.generate(Generator, resultBook, {
                root: outputFolder
            });
        });
    })
    .then(() => {
        console.log();
        console.log('Starting server ...');
        return server.start(outputFolder, port);
    })
    .then(() => {
        console.log('Serving book on http://localhost:' + port);

        if (lrPath && hasLiveReloading) {
            // trigger livereload
            lrServer.changed({
                body: {
                    files: [lrPath]
                }
            });
        }

        if (hasOpen) {
            open('http://localhost:' + port, browser);
        }
    })
    .then(() => {
        if (!hasWatch) {
            return waitForCtrlC();
        }

        return watch(book.getRoot())
        .then((filepath) => {
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
    exec(args, kwargs) {
        server = new Server();
        const hasWatch = kwargs['watch'];
        const hasLiveReloading = kwargs['live'];

        return Promise()
        .then(() => {
            if (!hasWatch || !hasLiveReloading) {
                return;
            }

            lrServer = tinylr({});
            return Promise.nfcall(lrServer.listen.bind(lrServer), kwargs.lrport)
            .then(() => {
                console.log('Live reload server started on port:', kwargs.lrport);
                console.log('Press CTRL+C to quit ...');
                console.log('');

            });
        })
        .then(() => {
            return generateBook(args, kwargs);
        });
    }
};
