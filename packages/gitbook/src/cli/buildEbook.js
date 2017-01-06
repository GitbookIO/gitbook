const path = require('path');
const tmp = require('tmp');

const Promise = require('../utils/promise');
const fs = require('../utils/fs');
const Parse = require('../parse');
const Output = require('../output');

const options = require('./options');
const getBook = require('./getBook');


module.exports = function(format) {
    return {
        name: (format + ' [book] [output]'),
        description: 'build a book into an ebook file',
        options: [
            options.log
        ],
        exec(args, kwargs) {
            const extension = '.' + format;

            // Output file will be stored in
            const outputFile = args[1] || ('book' + extension);

            // Create temporary directory
            const outputFolder = tmp.dirSync().name;

            const book = getBook(args, kwargs);
            const logger = book.getLogger();
            const Generator = Output.getGenerator('ebook');

            return Parse.parseBook(book)
            .then((resultBook) => {
                return Output.generate(Generator, resultBook, {
                    root: outputFolder,
                    format
                });
            })

            // Extract ebook file
            .then((output) => {
                const book = output.getBook();
                const languages = book.getLanguages();

                if (book.isMultilingual()) {
                    return Promise.forEach(languages.getList(), (lang) => {
                        const langID = lang.getID();

                        const langOutputFile = path.join(
                            path.dirname(outputFile),
                            path.basename(outputFile, extension) + '_' + langID + extension
                        );

                        return fs.copy(
                            path.resolve(outputFolder, langID, 'index' + extension),
                            langOutputFile
                        );
                    })
                    .thenResolve(languages.getCount());
                } else {
                    return fs.copy(
                        path.resolve(outputFolder, 'index' + extension),
                        outputFile
                    ).thenResolve(1);
                }
            })

            // Log end
            .then((count) => {
                logger.info.ok(count + ' file(s) generated');

                logger.debug('cleaning up... ');
                return logger.debug.promise(fs.rmDir(outputFolder));
            });
        }
    };
};
