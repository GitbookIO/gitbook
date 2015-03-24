var fs = require('fs');
var path = require('path');

describe('Glossary', function () {
    describe('Parsing', function() {
        var book;

        before(function() {
            return books.parse("glossary", "website")
                .then(function(_book) {
                    book = _book;
                });
        });

        it('should correctly list items', function() {
            book.should.have.property("glossary");
            book.glossary.should.have.lengthOf(2);
        });
    });
});
