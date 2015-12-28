var fs = require('fs');
var path = require('path');

describe('eBook generator', function () {
    describe('Basic Book', function() {
        var book;

        before(function() {
            return books.generate('basic', 'ebook')
                .then(function(_book) {
                    book = _book;
                });
        });

        it('should correctly output a SUMMARY.html', function() {
            book.should.have.file('SUMMARY.html');
        });

        it('should correctly copy assets', function() {
            book.should.have.file('gitbook');
            book.should.have.file('gitbook/ebook.css');
        });

        it('should not copy website assets', function() {
            book.should.not.have.file('gitbook/style.css');
        });
    });

    describe('Custom styles', function() {
        var book;

        before(function() {
            return books.generate('style-print', 'ebook')
                .then(function(_book) {
                    book = _book;
                });
        });

        it('should correctly copy print.css', function() {
            book.should.have.file('styles');
            book.should.have.file('styles/print.css');
        });

        it('should remove default print.css', function() {
            var PAGE = fs.readFileSync(
                path.join(book.options.output, 'index.html'),
                { encoding: 'utf-8' }
            );

            // There are 2 styles (one from plugin-highlight and the new style)
            PAGE.should.be.html({
                'link': {
                    count: 2
                }
            });

            PAGE.should.be.html({
                'link[href=\'./styles/print.css\']': {
                    count: 1
                }
            });

            PAGE.should.be.html({
                'link[href="gitbook/plugins/gitbook-plugin-highlight/ebook.css"]': {
                    count: 1
                }
            });
        });
    });
});
