const path = require('path');

const createNodeFS = require('./fs/node');
const fs = require('./utils/fs');
const Promise = require('./utils/promise');
const File = require('./models/file');
const Readme = require('./models/readme');
const Book = require('./models/book');
const Parse = require('./parse');
const SummaryModifier = require('./modifiers/summary');

/**
 * Initialize folder structure for a book
 * Read SUMMARY to created the right chapter
 *
 * @param {Book}
 * @param {String}
 * @return {Promise}
 */
function initBook(rootFolder) {
    const extension = '.md';

    return fs.mkdirp(rootFolder)

    // Parse the summary and readme
    .then(() => {
        const bookFS = createNodeFS(rootFolder);
        const book = Book.createForFS(bookFS);

        return Parse.parseReadme(book)

        // Setup default readme if doesn't found one
        .fail(() => {
            const readmeFile = File.createWithFilepath('README' + extension);
            const readme = Readme.create(readmeFile);
            return book.setReadme(readme);
        });
    })
    .then(Parse.parseSummary)

    .then((book) => {
        const logger = book.getLogger();
        const summary = book.getSummary();
        const summaryFile = summary.getFile();
        const summaryFilename = summaryFile.getPath() || ('SUMMARY' + extension);

        const articles = summary.getArticlesAsList();

        // Write pages
        return Promise.forEach(articles, (article) => {
            const articlePath = article.getPath();
            const filePath = articlePath ? path.join(rootFolder, articlePath) : null;
            if (!filePath) {
                return;
            }

            return fs.assertFile(filePath, () => {
                return fs.ensureFile(filePath)
                .then(() => {
                    logger.info.ln('create', article.getPath());
                    return fs.writeFile(filePath, '# ' + article.getTitle() + '\n\n');
                });
            });
        })

        // Write summary
        .then(() => {
            const filePath = path.join(rootFolder, summaryFilename);

            return fs.ensureFile(filePath)
            .then(() => {
                logger.info.ln('create ' + path.basename(filePath));
                const text = SummaryModifier.toText(summary, extension);
                return fs.writeFile(filePath, text);
            });
        })

        // Log end
        .then(() => {
            logger.info.ln('initialization is finished');
        });
    });
}

module.exports = initBook;
