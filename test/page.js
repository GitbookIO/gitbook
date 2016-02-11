var mock = require('./mock');

describe('Page', function() {
    var book;

    before(function() {
        return mock.setupDefaultBook({
            'heading.md': '# Hello\n\n## World'
        })
        .then(function(_book) {
            book = _book;
            return book.summary.load();
        });
    });

    it.only('should add a default ID to headings', function() {
        var page = book.addPage('heading.md');

        return page.parse()
        .then(function() {
            console.log(page.content);
        });

    });

});