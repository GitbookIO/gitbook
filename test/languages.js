describe("Languages", function () {
    describe("Parsing", function() {
        var book;

        before(function() {
            return books.parse("languages")
                .then(function(_book) {
                    book = _book;
                });
        });

        it("should correctly list languages", function() {
            book.should.have.property("books");
            book.books.should.have.lengthOf(2);

            book.books[0].options.language.should.be.equal("en");
            book.books[1].options.language.should.be.equal("fr");
        });
    });

    describe("Generation", function() {
        var book;

        before(function() {
            return books.generate("languages", "website")
                .then(function(_book) {
                    book = _book;
                });
        });

        it("should correctly create books", function() {
            book.should.have.file("index.html");
            book.should.have.file("en/index.html");
            book.should.have.file("fr/index.html");
        });
    });
});
