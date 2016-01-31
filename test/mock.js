var Q = require('q');
var _ = require('lodash');
var tmp = require('tmp');
var path = require('path');

require('should');
require('should-promised');

var Book = require('../').Book;
var Output = require('../lib/output');
var NodeFS = require('../lib/fs/node');

// Create filesystem instance for testing
var fs = new NodeFS();

function setupFS(fs, rootFolder, files) {
    return _.chain(_.pairs(files))
        .sortBy(0)
        .reduce(function(prev, pair) {
            return prev.then(function() {
                var filename = path.resolve(rootFolder, pair[0]);
                var buf = pair[1];

                if (_.isObject(buf)) buf = JSON.stringify(buf);
                if (_.isString(buf)) buf = new Buffer(buf, 'utf-8');

                return fs.write(filename, buf);
            });
        }, Q())
        .value()
        .then(function() {
            return fs;
        });
}

// Setup a mock book for testing using a map of files
function setupBook(files, opts) {
    opts = opts || {};
    opts.log = function() { };

    return Q.nfcall(tmp.dir.bind(tmp)).get(0)
    .then(function(folder) {
        opts.fs = fs;
        opts.root = folder;

        return setupFS(fs, folder, files);
    })
    .then(function(fs) {
        return new Book(opts);
    });
}

// Setup a book with default README/SUMMARY
function setupDefaultBook(files, opts) {
    return setupBook(_.defaults(files || {}, {
        'README.md': 'Hello',
        'SUMMARY.md': '# Summary'
    }), opts);
}

// Output a book with a specific generator
function outputDefaultBook(generator, files, opts) {
    return setupDefaultBook(files, opts)
    .then(function(book) {
        // Parse the book
        return book.parse()

        // Start generation
        .then(function() {
            var output = new Output(book, generator);
            return output.generate();
        });
    });
}

module.exports = {
    setupBook: setupBook,
    setupDefaultBook: setupDefaultBook,
    outputDefaultBook: outputDefaultBook
};
