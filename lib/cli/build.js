var Parse = require('../parse');
var Output = require('../output');
var timing = require('../utils/timing');

var options = require('./options');
var getBook = require('./getBook');
var getOutputFolder = require('./getOutputFolder');


module.exports = {
    name: 'build [book] [output]',
    description: 'build a book',
    options: [
        options.log,
        options.format,
        options.timing
    ],
    exec: function(args, kwargs) {
        var book = getBook(args, kwargs);
        var Generator = Output.getGenerator(kwargs.format);

        return Parse.parseBook(book)
        .then(function(resultBook) {
            var outputFolder = getOutputFolder(resultBook, args);

            return Output.generate(Generator, resultBook, {
                root: outputFolder
            });
        })
        .fin(function() {
            if (kwargs.timing) timing.dump(book.getLogger());
        });
    }
};
