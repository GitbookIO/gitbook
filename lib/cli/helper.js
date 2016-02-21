var _ = require('lodash');
var path = require('path');

var Book = require('../book');
var NodeFS = require('../fs/node');
var Logger = require('../utils/logger');
var fs = require('../utils/fs');
var JSONOutput = require('../output/json');
var WebsiteOutput = require('../output/website');
var EBookOutput = require('../output/ebook');

var LOG_OPTION = {
    name: 'log',
    description: 'Minimum log level to display',
    values: _.chain(Logger.LEVELS)
        .keys()
        .map(function(s) {
            return s.toLowerCase();
        })
        .value(),
    defaults: 'info'
};

var FORMAT_OPTION = {
    name: 'format',
    description: 'Format to build to',
    values: ['website', 'json', 'ebook'],
    defaults: 'website'
};

var FORMATS = {
    json: JSONOutput,
    website: WebsiteOutput,
    ebook: EBookOutput
};

// Commands which is processing a book
// the root of the book is the first argument (or current directory)
function bookCmd(fn) {
    return function(args, kwargs) {
        var input = path.resolve(args[0] || process.cwd());
        var book = new Book({
            fs: new NodeFS(),
            root: input,

            logLevel: kwargs.log
        });

        return fn(book, args.slice(1), kwargs);
    };
}

// Commands which is working on a Output instance
function outputCmd(fn) {
    return bookCmd(function(book, args, kwargs) {
        var Out = FORMATS[kwargs.format];
        return fn(new Out(book), args);
    });
}

// Command to generate an ebook
function ebookCmd(format) {
    return {
        name: format + ' [book] [output] [file]',
        description: 'generates ebook '+format,
        options: [
            LOG_OPTION
        ],
        exec: bookCmd(function(book, args, kwargs) {
            return fs.tmpDir()
            .then(function(dir) {
                var outputFile = path.resolve(process.cwd(), args[1] || 'book.' + format);
                var output = new EBookOutput(book, {
                    format: format
                });

                return output.book.parse()
                .then(function() {
                    // Set output folder
                    output.book.config.set('output', dir);
                    return output.generate();
                })

                // Copy the ebook file
                .then(function() {
                    return fs.copy(
                        path.resolve(dir, 'index.' + format),
                        outputFile
                    );
                });
            });
        })
    };
}

module.exports = {
    bookCmd: bookCmd,
    outputCmd: outputCmd,
    ebookCmd: ebookCmd,

    options: {
        log: LOG_OPTION,
        format: FORMAT_OPTION
    },

    FORMATS: FORMATS
};
