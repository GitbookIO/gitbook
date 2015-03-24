var fs = require('fs');
var path = require('path');

describe('eBook generator', function () {
    describe('Basic Book', function() {
        var book;

        before(function() {
            return books.generate("basic", "ebook")
                .then(function(_book) {
                    book = _book;
                });
        });

        it('should correctly output a SUMMARY.html', function() {
            book.should.have.file("SUMMARY.html");
        });

        it('should correctly copy assets', function() {
            book.should.have.file("gitbook");
            book.should.have.file("gitbook/style.css");
        });
    });
});
