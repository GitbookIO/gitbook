var fs = require('fs');
var path = require('path');

describe('Summary', function () {
    describe('Parsing', function() {
        var book;

        before(function() {
            return books.parse("summary", "website")
                .then(function(_book) {
                    book = _book;
                });
        });

        it('should correctly list items', function() {
            book.should.have.property("summary");
            book.summary.should.have.property("chapters");
            book.summary.chapters.should.have.lengthOf(4);
        });

        it('should correctly mark non-existant entries', function() {
            book.summary.chapters[0].exists.should.have.equal(true);
            book.summary.chapters[1].exists.should.have.equal(true);
            book.summary.chapters[2].exists.should.have.equal(true);
            book.summary.chapters[3].exists.should.have.equal(false);
        });
    });

    describe('Generation', function() {
        var book;

        before(function() {
            return books.generate("summary", "website")
                .then(function(_book) {
                    book = _book;
                });
        });

        it('should create files according to summary', function() {
            book.should.have.file("index.html");
            book.should.have.file("PAGE1.html");
            book.should.have.file("folder/PAGE2.html");
        });
    });
});
