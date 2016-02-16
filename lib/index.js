var Book = require('./book');
var Output = require('./output');
var NodeFS = require('./fs/node');

// Setup a Book for the arguments
function setupBook(args) {
    var input = args[0] || process.cwd();
    return new Book({
        fs: new NodeFS(),
        root: input
    });
}

// Setup an Output for the arguments
function setupOutput(Out, args) {
    return new Out(setupBook(args));
}

module.exports = {
    Book: Book,
    commands: [
        {
            name: 'install [book]',
            description: 'install all plugins dependencies',
            exec: function(args) {
                var book = setupBook(args);

                return book.config.load()
                .then(function() {
                    return book.plugins.install();
                })
                .then(function(){
                    console.log('');
                    console.log(color.green('Done, without error'));
                });
            }
        },

    ]
};
