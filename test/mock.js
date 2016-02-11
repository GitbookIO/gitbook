var Q = require('q');
var _ = require('lodash');
var fs = require('fs');
var tmp = require('tmp');
var path = require('path');

var should = require('should');

var Book = require('../').Book;
var Output = require('../lib/output');
var NodeFS = require('../lib/fs/node');

// Create filesystem instance for testing
var nodeFS = new NodeFS();

function setupFS(_fs, rootFolder, files) {
    return _.chain(_.pairs(files))
        .sortBy(0)
        .reduce(function(prev, pair) {
            return prev.then(function() {
                var filename = path.resolve(rootFolder, pair[0]);
                var buf = pair[1];

                if (_.isObject(buf)) buf = JSON.stringify(buf);
                if (_.isString(buf)) buf = new Buffer(buf, 'utf-8');

                return _fs.write(filename, buf);
            });
        }, Q())
        .value()
        .then(function() {
            return _fs;
        });
}

// Setup a mock book for testing using a map of files
function setupBook(files, opts) {
    opts = opts || {};
    opts.log = function() { };

    return Q.nfcall(tmp.dir.bind(tmp)).get(0)
    .then(function(folder) {
        opts.fs = nodeFS;
        opts.root = folder;

        return setupFS(nodeFS, folder, files);
    })
    .then(function() {
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
            return output.generate()
                .thenResolve(output);
        });
    });
}

// Assertions to test if an Output has generated a file
should.Assertion.add('file', function(file, description) {
    this.params = {
        actual: this.obj.toString(),
        operator: 'have file ' + file,
        message: description
    };

    this.obj.should.have.property('resolve').which.is.a.Function;
    this.assert(fs.existsSync(this.obj.resolve(file)));
});


module.exports = {
    setupBook: setupBook,
    setupDefaultBook: setupDefaultBook,
    outputDefaultBook: outputDefaultBook
};
