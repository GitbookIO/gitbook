var path = require('path');
var _ = require('lodash');
var assert = require('assert');

var fs = require("fs");
var git = require("../lib/utils/git");

describe('GIT parser and getter', function () {
    it('should correctly parse an https url', function() {
        var parts = git.parseUrl("git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test.md");
        assert(parts);
        assert.equal(parts.host, "https://gist.github.com/69ea4542e4c8967d2fa7.git");
        assert.equal(parts.ref, "master");
        assert.equal(parts.filepath, "test.md");
    });

    it('should correctly parse an https url with a reference', function() {
        var parts = git.parseUrl("git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test.md#0.1.2");
        assert(parts);
        assert.equal(parts.host, "https://gist.github.com/69ea4542e4c8967d2fa7.git");
        assert.equal(parts.ref, "0.1.2");
        assert.equal(parts.filepath, "test.md");
    });

    it('should correctly parse an ssh url', function() {
        var parts = git.parseUrl("git+git@github.com:GitbookIO/gitbook.git/directory/README.md#e1594cde2c32e4ff48f6c4eff3d3d461743d74e1");
        assert(parts);
        assert.equal(parts.host, "git@github.com:GitbookIO/gitbook.git");
        assert.equal(parts.ref, "e1594cde2c32e4ff48f6c4eff3d3d461743d74e1");
        assert.equal(parts.filepath, "directory/README.md");
    });
});
