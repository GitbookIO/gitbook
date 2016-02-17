var path = require('path');

var PluginsManager = require('../plugins');
var helper = require('./helper');

module.exports = {
    commands: [

        {
            name: 'parse [book]',
            description: 'parse and returns debug information for a book',
            options: [
                helper.options.log
            ],
            exec: helper.bookCmd(function(book) {
                return book.parse()
                .then(function() {
                    book.log.info.ln('');

                    if (book.config.exists()) book.log.info.ln('Configuration:', book.config.path);

                    if (book.isMultilingual()) {
                        book.log.info.ln('Multilingual book detected:', book.langs.path);
                    } else {
                        book.log.info.ln('Readme:', book.readme.path);
                        book.log.info.ln('Summary:', book.summary.path);
                        if (book.glossary.exists()) book.log.info.ln('Glossary:', book.glossary.path);
                    }
                });
            })
        },

        {
            name: 'install [book]',
            description: 'install all plugins dependencies',
            options: [
                helper.options.log
            ],
            exec: helper.bookCmd(function(book, args) {
                var plugins = new PluginsManager(book);
                return plugins.install();
            })
        },

        {
            name: 'build [book] [output]',
            description: 'build a book',
            options: [
                helper.options.log,
                helper.options.format
            ],
            exec: helper.outputCmd(function(output, args, kwargs) {
                return output.book.parse()
                .then(function() {
                    // Set output folder
                    if (args[0]) {
                        output.book.config.set('output', path.resolve(process.cwd(), args[0]));
                    }

                    return output.generate();
                });
            })
        }


    ]
};
