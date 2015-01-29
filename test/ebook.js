var path = require('path');
var _ = require('lodash');
var assert = require('assert');

var fs = require("fs");
var fsUtil = require("../lib/utils/fs");


describe('eBook Generator', function () {
    it('should correctly generate ebook pages', function(done) {
        testGeneration(books[1], "ebook", function(output) {
            assert(fs.existsSync(path.join(output, "SUMMARY.html")));
        }, done);
    });

    it('should correctly convert svg images to png', function(done) {
        testGeneration(books[4], "ebook", function(output) {
            var readmeContent = fs.readFileSync(path.join(output, "index.html"), {encoding: "utf8"});
            var pageContent = fs.readFileSync(path.join(output, "sub/PAGE.html"), {encoding: "utf8"});

            assert(fs.existsSync(path.join(output, "test.png")));
            assert(fs.existsSync(path.join(output, "NewTux.png")));

            assert(!fs.existsSync(path.join(output, "test_0.png")));
            assert(!fs.existsSync(path.join(output, "sub/test.png")));
            assert(!fs.existsSync(path.join(output, "sub/NewTux.png")));

            assert(pageContent.indexOf('src="../test.png"') >= 0);
            assert(pageContent.indexOf('src="../NewTux.png"') >= 0);
            assert(pageContent.indexOf('<svg') < 0);

            assert(readmeContent.indexOf('src="test.png"') >= 0);
            assert(readmeContent.indexOf('src="NewTux.png"') >= 0);
        }, done);
    });
});
