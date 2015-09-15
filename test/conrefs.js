var fs = require('fs');
var path = require('path');

describe('ConRefs', function () {
    var book, readme;

    before(function() {
        return books.generate("conrefs", "website")
            .then(function(_book) {
                book = _book;

                readme = fs.readFileSync(
                    path.join(book.options.output, "index.html"),
                    { encoding: "utf-8" }
                );
            });
    });

    it('should handle local references', function() {
        readme.should.be.html({
            ".page-inner p#t1": {
                count: 1,
                text: "Hello World",
                trim: true
            }
        });
    });

    it('should handle local references with absolute paths', function() {
        readme.should.be.html({
            ".page-inner p#t2": {
                count: 1,
                text: "Hello World",
                trim: true
            }
        });
    });

    it('should handle git references', function() {
        readme.should.be.html({
            ".page-inner p#t3": {
                count: 1,
                text: "Hello from git",
                trim: true
            },
            ".page-inner p#t4": {
                count: 1,
                text: "First Hello. Hello from git",
                trim: true
            }
        });
    });
});
