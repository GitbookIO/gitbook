const Parse = require('../parse');
const Output = require('../output');
const timing = require('../utils/timing');

const options = require('./options');
const getBook = require('./getBook');
const getOutputFolder = require('./getOutputFolder');


module.exports = {
    name: 'build [book] [output]',
    description: 'build a book',
    options: [
        options.log,
        options.format,
        options.timing
    ],
    exec(args, kwargs) {
        const book = getBook(args, kwargs);
        const outputFolder = getOutputFolder(args);

        const Generator = Output.getGenerator(kwargs.format);

        return Parse.parseBook(book)
        .then(function(resultBook) {
            return Output.generate(Generator, resultBook, {
                root: outputFolder
            });
        })
        .fin(function() {
            if (kwargs.timing) timing.dump(book.getLogger());
        });
    }
};
