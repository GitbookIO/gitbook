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

    it('should add a default ID to headings', function() {
        var page = book.addPage('heading.md');

        return page.parse()
        .then(function() {
            page.content.should.be.html({
                'h1#hello': {
                    count: 1
                },
                'h2#world': {
                    count: 1
                }
            });
        });

    });

});