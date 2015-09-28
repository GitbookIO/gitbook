var should = require("should");

describe("Navigation", function () {
    var book;

    before(function() {
        return books.parse("summary")
            .then(function(_book) {
                book = _book;
            });
    });

    it("should correctly parse navigation as a map", function() {
        book.should.have.property("navigation");
        book.navigation.should.have.property("README.md");
        book.navigation.should.have.property("README.md");
    });

    it("should correctly include filenames", function() {
        book.navigation.should.have.property("README.md");
        book.navigation.should.have.property("PAGE1.md");
        book.navigation.should.have.property("folder/PAGE2.md");
        book.navigation.should.not.have.property("NOTFOUND.md");
    });

    it("should correctly detect next/prev for README", function() {
        var README = book.navigation["README.md"];

        README.index.should.equal(0);
        README.should.have.property("next");
        should(README.prev).not.be.ok();

        README.next.should.have.property("path");
        README.next.path.should.equal("PAGE1.md");
    });

    it("should correctly detect next/prev a page", function() {
        var PAGE = book.navigation["PAGE1.md"];

        PAGE.index.should.equal(1);
        PAGE.should.have.property("next");
        PAGE.should.have.property("prev");

        PAGE.prev.should.have.property("path");
        PAGE.prev.path.should.equal("README.md");

        PAGE.next.should.have.property("path");
        PAGE.next.path.should.equal("folder/PAGE2.md");
    });

    it("should correctly detect next/prev for last page", function() {
        var PAGE = book.navigation["folder/PAGE2.md"];

        PAGE.index.should.equal(2);
        PAGE.should.have.property("prev");
        should(PAGE.next).not.be.ok();

        PAGE.prev.should.have.property("path");
        PAGE.prev.path.should.equal("PAGE1.md");
    });
});
