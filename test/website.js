var fs = require('fs');
var path = require('path');

describe('Website generator', function () {
    describe('Basic Book', function() {
        var book;

        before(function() {
            return books.generate("basic", "website")
                .then(function(_book) {
                    book = _book;
                });
        });

        it('should correctly output an index.html', function() {
            book.should.have.file("index.html");
        });

        it('should correctly copy assets', function() {
            book.should.have.file("gitbook");
            book.should.have.file("gitbook/app.js");
            book.should.have.file("gitbook/style.css");
        });
    });
});
