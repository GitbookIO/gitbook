var fs = require("fs");
var path = require("path");

describe("Summary", function () {
    describe("Parsing", function() {
        var book;

        before(function() {
            return books.parse("summary")
                .then(function(_book) {
                    book = _book;
                });
        });

        it("should correctly list items", function() {
            book.should.have.property("summary");
            book.summary.should.have.property("chapters");
            book.summary.chapters.should.have.lengthOf(4);
        });

        it("should correctly mark non-existant entries", function() {
            book.summary.chapters[0].exists.should.have.equal(true);
            book.summary.chapters[1].exists.should.have.equal(true);
            book.summary.chapters[2].exists.should.have.equal(true);
            book.summary.chapters[3].exists.should.have.equal(false);
        });
    });

    describe("Generation", function() {
        var book;

        before(function() {
            return books.generate("summary", "website")
                .then(function(_book) {
                    book = _book;
                });
        });

        it("should create files according to summary", function() {
            book.should.have.file("index.html");
            book.should.have.file("PAGE1.html");
            book.should.have.file("folder/PAGE2.html");
        });

        it("should correctly output summary", function() {
            var PAGE = fs.readFileSync(
                path.join(book.options.output, "index.html"),
                { encoding: "utf-8" }
            );

            PAGE.should.be.html({
                ".book-summary .chapter[data-level=\"0\"] a": {
                    attributes: {
                        href: "./index.html"
                    }
                },
                ".book-summary .chapter[data-level=\"1\"] a": {
                    attributes: {
                        href: "./PAGE1.html"
                    }
                },
                ".book-summary .chapter[data-level=\"2\"] a": {
                    attributes: {
                        href: "./folder/PAGE2.html"
                    }
                }
            });
        });
    });
});
