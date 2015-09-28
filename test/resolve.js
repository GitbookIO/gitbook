var path = require("path");

describe("Resolve Files", function () {
    var book;

    before(function() {
        return books.parse("basic")
            .then(function(_book) {
                book = _book;
            });
    });

    describe("book.fileIsInBook", function() {
        it("should return true for correct paths", function() {
            book.fileIsInBook(path.join(book.root, "README.md")).should.equal(true);
            book.fileIsInBook(path.join(book.root, "styles/website.css")).should.equal(true);
        });

        it("should return true for root folder", function() {
            book.fileIsInBook(path.join(book.root, "./")).should.equal(true);
            book.fileIsInBook(book.root).should.equal(true);
        });

        it("should return false for files out of scope", function() {
            book.fileIsInBook(path.join(book.root, "../")).should.equal(false);
            book.fileIsInBook("README.md").should.equal(false);
            book.fileIsInBook(path.resolve(book.root, "../README.md")).should.equal(false);
        });

        it("should correctly handle windows paths", function() {
            book.fileIsInBook(path.join(book.root, "\\styles\\website.css")).should.equal(true);
        });
    });

    describe("book.resolve", function() {
        it("should resolve a file to its absolute path", function() {
            book.resolve("README.md").should.equal(path.resolve(book.root, "README.md"));
            book.resolve("website/README.md").should.equal(path.resolve(book.root, "website/README.md"));
        });

        it("should correctly handle windows paths", function() {
            book.resolve("styles\\website.css").should.equal(path.resolve(book.root, "styles\\website.css"));
        });

        it("should correctly resolve all arguments", function() {
            book.resolve("test", "hello", "..", "README.md").should.equal(path.resolve(book.root, "test/README.md"));
        });

        it("should correctly resolve to root folder", function() {
            book.resolve("test", "/README.md").should.equal(path.resolve(book.root, "README.md"));
            book.resolve("test", "\\README.md").should.equal(path.resolve(book.root, "README.md"));
        });

        it("should throw an error for file out of book", function() {
            (function() {
                return book.resolve("../README.md");
            }).should.throw();
        });
    });
});
