var fs = require("fs");
var _ = require("lodash");
var path = require("path");
var cheerio = require("cheerio");

describe("Images", function () {
    var book, readme, $, $img, srcs;

    before(function() {
        return books.generate("images", "ebook")
            .then(function(_book) {
                book = _book;

                readme = fs.readFileSync(
                    path.join(book.options.output, "index.html"),
                    { encoding: "utf-8" }
                );
                $ = cheerio.load(readme);
                $img = $("img");
                srcs = $img.map(function() {
                    return $(this).attr("src");
                });
            });
    });

    it("should detect all images", function() {
        _.uniq(srcs).should.have.lengthOf(4);
    });

    it("should keep image tags", function() {
        srcs.should.have.lengthOf(5);
    });

    it("should not have .svg files", function() {
        _.each(srcs, function(src) {
            path.extname(src).should.not.equal(".svg");
        });
    });

    it("should correctly convert svg images to png", function() {
        _.each(srcs, function(src) {
            book.should.have.file(src);
        });
    });

    it("should handle relative paths", function() {
        var PAGE = fs.readFileSync(
            path.join(book.options.output, "folder/PAGE.html"),
            { encoding: "utf-8" }
        );

        PAGE.should.be.html({
            "img[src=\"../test.png\"]": {
                count: 1
            }
        });
    });
});
