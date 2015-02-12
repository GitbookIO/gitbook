var path = require('path');
var _ = require('lodash');
var assert = require('assert');
var cheerio = require('cheerio');

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
            // Check that all images exists
            _.each([
                "index.html",
                "sub/PAGE.html"
            ], function(pageName) {
                var pageFile = path.join(output, pageName);
                var pageFolder = path.dirname(pageFile);
                var pageContent = fs.readFileSync(pageFile, {encoding: "utf8"});
                var $ = cheerio.load(pageContent);

                $("img").each(function() {
                    var src = $(this).attr("src");
                    console.log(path.resolve(pageFolder, src));
                    assert(fs.existsSync(path.resolve(pageFolder, src)), src+" not found for page "+pageName);
                })
            });
        }, done);
    });
});
