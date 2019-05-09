var path = require('path');

var createNodeFS = require('./fs/node');
var fs = require('./utils/fs');
var Promise = require('./utils/promise');
var File = require('./models/file');
var Readme = require('./models/readme');
var Book = require('./models/book');
var Parse = require('./parse');

/**
    Initialize folder structure for a book
    Read SUMMARY to created the right chapter

    @param {Book}
    @param {String}
    @return {Promise}
*/
function initBook(rootFolder) {
    var extension = '.md';

    return fs.mkdirp(rootFolder)

    // Parse the summary and readme
    .then(function() {
        var fs = createNodeFS(rootFolder);
        var book = Book.createForFS(fs);

        return Parse.parseReadme(book)

        // Setup default readme if doesn't found one
        .fail(function() {
            var readmeFile = File.createWithFilepath('README' + extension);
            var readme = Readme.create(readmeFile);
            return book.setReadme(readme);
        });
    })
    .then(Parse.parseSummary)

    .then(function(book) {
        var logger = book.getLogger();
        var summary = book.getSummary();
        var summaryFile = summary.getFile();
        var summaryFilename = summaryFile.getPath() || ('SUMMARY' + extension);

        var articles = summary.getArticlesAsList();

        // Write pages
        return Promise.forEach(articles, function(article) {
            var articlePath = article.getPath();
            var filePath = articlePath? path.join(rootFolder, articlePath) : null;
            if (!filePath) {
                return;
            }

            return fs.assertFile(filePath, function() {
                return fs.ensureFile(filePath)
                .then(function() {
                    logger.info.ln('create', article.getPath());
                    return fs.writeFile(filePath, '# ' + article.getTitle() + '\n\n');
                });
            });
        })

        // Write summary
        .then(function() {
            var filePath = path.join(rootFolder, summaryFilename);

            return fs.ensureFile(filePath)
            .then(function() {
                logger.info.ln('create ' + path.basename(filePath));
                return fs.writeFile(filePath, summary.toText(extension));
            });
        })

        // Log end
        .then(function() {
            logger.info.ln('initialization is finished');
        });
    });
}

module.exports = initBook;
