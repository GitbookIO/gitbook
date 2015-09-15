var should = require("should");
var git = require("../lib/utils/git");

describe("GIT parser and getter", function () {
    it("should correctly parse an https url", function() {
        var parts = git.parseUrl("git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test.md");

        should.exist(parts);
        parts.host.should.be.equal("https://gist.github.com/69ea4542e4c8967d2fa7.git");
        parts.ref.should.be.equal("master");
        parts.filepath.should.be.equal("test.md");
    });

    it("should correctly parse an https url with a reference", function() {
        var parts = git.parseUrl("git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test.md#0.1.2");

        should.exist(parts);
        parts.host.should.be.equal("https://gist.github.com/69ea4542e4c8967d2fa7.git");
        parts.ref.should.be.equal("0.1.2");
        parts.filepath.should.be.equal("test.md");
    });

    it("should correctly parse an ssh url", function() {
        var parts = git.parseUrl("git+git@github.com:GitbookIO/gitbook.git/directory/README.md#e1594cde2c32e4ff48f6c4eff3d3d461743d74e1");

        should.exist(parts);
        parts.host.should.be.equal("git@github.com:GitbookIO/gitbook.git");
        parts.ref.should.be.equal("e1594cde2c32e4ff48f6c4eff3d3d461743d74e1");
        parts.filepath.should.be.equal("directory/README.md");
    });
});
