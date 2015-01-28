var path = require('path');
var _ = require('lodash');
var assert = require('assert');

var links = require("../lib/utils/links");

describe('Links', function () {
    it('should correctly test external links', function() {
        assert(links.isExternal("http://google.fr"));
        assert(links.isExternal("https://google.fr"));
        assert(!links.isExternal("test.md"));
        assert(!links.isExternal("folder/test.md"));
        assert(!links.isExternal("/folder/test.md"));
    });

    describe('toAbsolute', function() {
        it('should correctly transform as absolute', function() {
            assert.equal(links.toAbsolute("http://google.fr"), "http://google.fr");
            assert.equal(links.toAbsolute("test.md", "./", "./"), "test.md");
            assert.equal(links.toAbsolute("folder/test.md", "./", "./"), "folder/test.md");
        });

        it('should correctly handle windows path', function() {
            assert.equal(links.toAbsolute("folder\\test.md", "./", "./"), "folder/test.md");
        });

        it('should correctly handle absolute path', function() {
            assert.equal(links.toAbsolute("/test.md", "./", "./"), "test.md");
            assert.equal(links.toAbsolute("/test.md", "test", "test"), "../test.md");
            assert.equal(links.toAbsolute("/sub/test.md", "test", "test"), "../sub/test.md");
        });
    });
});
