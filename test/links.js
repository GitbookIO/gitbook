var should = require('should');
var links = require("../lib/utils/links");

describe('Links', function () {
    it('should correctly test external links', function() {
        links.isExternal("http://google.fr").should.be.exactly(true);
        links.isExternal("https://google.fr").should.be.exactly(true);
        links.isExternal("test.md").should.be.exactly(false);
        links.isExternal("folder/test.md").should.be.exactly(false);
        links.isExternal("/folder/test.md").should.be.exactly(false);
    });

    it('should correctly detect anchor links', function() {
        links.isAnchor("#test").should.be.exactly(true);
        links.isAnchor(" #test").should.be.exactly(true);
        links.isAnchor("https://google.fr#test").should.be.exactly(false);
        links.isAnchor("test.md#test").should.be.exactly(false);
    });

    describe('toAbsolute', function() {
        it('should correctly transform as absolute', function() {
            links.toAbsolute("http://google.fr").should.be.equal("http://google.fr");
            links.toAbsolute("test.md", "./", "./").should.be.equal("test.md");
            links.toAbsolute("folder/test.md", "./", "./").should.be.equal("folder/test.md");
        });

        it('should correctly handle windows path', function() {
            links.toAbsolute("folder\\test.md", "./", "./").should.be.equal("folder/test.md");
        });

        it('should correctly handle absolute path', function() {
            links.toAbsolute("/test.md", "./", "./").should.be.equal("test.md");
            links.toAbsolute("/test.md", "test", "test").should.be.equal("../test.md");
            links.toAbsolute("/sub/test.md", "test", "test").should.be.equal("../sub/test.md");
        });
    });
});
