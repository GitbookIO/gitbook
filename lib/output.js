var Promise = require('./utils/promise');
var generators = require('./generators');
var PluginsManager = require('./plugins');

function Output(book, type) {
    if (!generators[type]) throw new Error('Generator not found"' + type + '"');

    this.book = book;
    this.type = type;
    this.plugins = new PluginsManager(book);
    this.generator = new generators[type](this, type);
}

// Write a file to the output folder
Output.prototype.writeFile = function(filename, buf) {

};

// Start the generation, for a parsed book
Output.prototype.generate = function() {
    var that = this;
    var isMultilingual = this.isMultilingual();

    return Promise()

    // Initialize the generation
    .then(function() {
        return that.generator.prepare();
    })

    // Process all files
    .then(function() {
        return that.book.fs.listAllFiles(that.book.root);
    })
    .then(function(files) {
        return Promise.serie(files, function(filename) {
            // Ignore file present in a language book
            if (isMultilingual && that.book.isInLanguageBook(filename)) return;

            // Process file as page or asset
            if (that.book.hasPage(filename)) {
                return that.generator.writePage(that.book.getPage(filename));
            } else {
                return that.generator.writeAsset(filename);
            }
        });
    })

    // Finish the generation
    .then(function() {
        return that.generator.finish();
    });
};

module.exports = Output;
