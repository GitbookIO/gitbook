var _ = require('lodash');

var Book = require('../book');
var NodeFS = require('../fs/node');
var Logger = require('../utils/logger');
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

        var input = args[0] || process.cwd();
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

module.exports = {
    bookCmd: bookCmd,
    outputCmd: outputCmd,

    options: {
        log: LOG_OPTION,
        format: FORMAT_OPTION
    }
};
