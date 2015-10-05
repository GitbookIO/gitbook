var _ = require('lodash');
var Q = require('q');
var path = require('path');

var Book = require('./book');
var fs = require('./utils/fs');

// Initialize folder structure for a book
// Read SUMMARY to created the right chapter
function initBook(root, opts) {
    var book = new Book(root, opts);
    var extensionToUse = '.md';

    var chaptersPaths = function(chapters) {
        return _.reduce(chapters || [], function(accu, chapter) {
            var o = {
                title: chapter.title
            };
            if (chapter.path) o.path = chapter.path;

            return accu.concat(
                [o].concat(chaptersPaths(chapter.articles))
            );
        }, []);
    };

    book.log.info.ln('init book at', root);
    return fs.mkdirp(root)
    .then(function() {
        book.log.info.ln('detect structure from SUMMARY (if it exists)');
        return book.parseSummary();
    })
    .fail(function() {
        return Q();
    })
    .then(function() {
        var summary = book.summaryFile || 'SUMMARY.md';
        var chapters = book.summary.chapters || [];
        extensionToUse = path.extname(summary);

        if (chapters.length === 0) {
            chapters = [
                {
                    title: 'Summary',
                    path: 'SUMMARY'+extensionToUse
                },
                {
                    title: 'Introduction',
                    path: 'README'+extensionToUse
                }
            ];
        }

        return Q(chaptersPaths(chapters));
    })
    .then(function(chapters) {
        // Create files that don't exist
        return Q.all(_.map(chapters, function(chapter) {
            if (!chapter.path) return Q();
            var absolutePath = path.resolve(book.root, chapter.path);

            return fs.exists(absolutePath)
            .then(function(exists) {
                if(exists) {
                    book.log.info.ln('found', chapter.path);
                    return;
                } else {
                    book.log.info.ln('create', chapter.path);
                }

                return fs.mkdirp(path.dirname(absolutePath))
                .then(function() {
                    return fs.writeFile(absolutePath, '# '+chapter.title+'\n');
                });
            });
        }));
    })
    .then(function() {
        book.log.info.ln('initialization is finished');
    });
}

module.exports = initBook;
