var mock = require('./mock');
var Output = require('../lib/output/base');

describe('Page', function() {
    var book, output;

    before(function() {
        return mock.setupDefaultBook({
            'heading.md': '# Hello\n\n## World',
            'links.md': '[link](hello.md) [readme](README.md)'
        })
        .then(function(_book) {
            book = _book;
            output = new Output(book);

            return book.parse();
        });
    });

    describe('Headings', function() {
        it('should add a default ID to headings', function() {
            var page = book.addPage('heading.md');

            return page.parse(output)
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

    describe('Links', function() {
        var page;

        before(function() {
            page = book.addPage('links.md');
            return page.parse(output);
        });

        it('should replace links to page to .html', function() {
            page.content.should.be.html({
                'a[href="index.html"]': {
                    count: 1
                }
            });
        });

        it('should not replace links to file not in SUMMARY', function() {
            page.content.should.be.html({
                'a[href="hello.md"]': {
                    count: 1
                }
            });
        });
    });

});