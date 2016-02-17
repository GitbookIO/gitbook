var _ = require('lodash');

var Book = require('../book');
var NodeFS = require('../fs/node');
var Logger = require('../utils/logger');

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

        return fn(book, args.slice(1));
    };
}

// Commands which is working on a Output instance
function outputCmd(Out, fn) {
    return bookCmd(function(book, args) {
        return fn(new Out(book), args);
    });
}

module.exports = {
    bookCmd: bookCmd,
    outputCmd: outputCmd,

    options: {
        log: LOG_OPTION
    }
};
