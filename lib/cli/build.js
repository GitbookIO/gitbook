var path = require('path');

var options = require('./options');
var getBook = require('./getBook');

var Parse = require('../parse');
var Output = require('../output');

module.exports = {
    name: 'build [book] [output]',
    description: 'build a book',
    options: [
        options.log,
        options.format
    ],
    exec: function(args, kwargs) {
        var book = getBook(args, kwargs);
        var Generator = Output.getGenerator(kwargs.format);

        return Parse.parseBook(book)
        .then(function(resultBook) {
            var defaultOutputRoot = path.join(resultBook.getRoot(), '_book');
            var outputFolder = args[1]? path.resolve(process.cwd(), args[1]) : defaultOutputRoot;

            return Output.generate(Generator, resultBook, {
                root: outputFolder
            });
        });
    }
};
