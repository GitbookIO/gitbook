var path = require('path');
var fs = require('fs');

describe('Headings', function () {
    var book, PAGE;

    before(function() {
        return books.generate('headings', 'website')
        .then(function(_book) {
            book = _book;

            PAGE = fs.readFileSync(
                path.join(book.options.output, 'index.html'),
                { encoding: 'utf-8' }
            );
        });
    });

    describe('IDs', function() {
        it('should correctly generate an ID', function() {
            PAGE.should.be.html({
                'h1#hello-world': {
                    count: 1
                }
            });
        });

        it('should correctly accept custom ID', function() {
            PAGE.should.be.html({
                'h2#hello-custom': {
                    count: 1
                }
            });
        });
    });
});

