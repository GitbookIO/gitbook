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

    describe('Generation', function() {
        var book;

        before(function() {
            return books.generate("glossary", "website")
                .then(function(_book) {
                    book = _book;
                });
        });

        it('should correctly generate a GLOSSARY.html', function() {
            book.should.have.file("GLOSSARY.html");
        });

        describe('Page Integration', function() {
            var page;

            before(function() {
                page = fs.readFileSync(
                    path.join(book.options.output, "index.html"),
                    { encoding: "utf-8" }
                );
            });

            it('should correctly replaced terms by links', function() {
                page.should.be.html(".page-inner a[href='GLOSSARY.html#test']", {
                    count: 1,
                    text: "test",
                    attributes: {
                        title: "Just a simple and easy to understand test."
                    }
                });
            });
        });
    });
});
