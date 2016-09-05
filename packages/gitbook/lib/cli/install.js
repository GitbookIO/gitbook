var options = require('./options');
var getBook = require('./getBook');

var Parse = require('../parse');
var Plugins = require('../plugins');

module.exports = {
    name: 'install [book]',
    description: 'install all plugins dependencies',
    options: [
        options.log
    ],
    exec: function(args, kwargs) {
        var book = getBook(args, kwargs);

        return Parse.parseConfig(book)
        .then(function(resultBook) {
            return Plugins.installPlugins(resultBook);
        });
    }
};
