var pkg = require("../package.json");

describe("Templating", function () {
    var book;

    before(function() {
        return books.parse("basic")
            .then(function(_book) {
                book = _book;
            });
    });

    var testTpl = function(str, args, options) {
        return book.template.renderString(str, args, options)
        .then(book.template.postProcess);
    };

    describe("Context", function() {
        it("should correctly have access to generator", function() {
            return testTpl("{{ gitbook.generator }}")
                .then(function(content) {
                    content.should.equal("website");
                });
        });

        it("should correctly have access to gitbook version", function() {
            return testTpl("{{ gitbook.version }}")
                .then(function(content) {
                    content.should.equal(pkg.version.toString());
                });
        });
    });
});
