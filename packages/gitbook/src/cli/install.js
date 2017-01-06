const options = require('./options');
const getBook = require('./getBook');

const Parse = require('../parse');
const Plugins = require('../plugins');

module.exports = {
    name: 'install [book]',
    description: 'install all plugins dependencies',
    options: [
        options.log
    ],
    exec(args, kwargs) {
        const book = getBook(args, kwargs);

        return Parse.parseConfig(book)
        .then((resultBook) => {
            return Plugins.installPlugins(resultBook);
        });
    }
};
