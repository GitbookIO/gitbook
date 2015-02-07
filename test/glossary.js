var path = require('path');
var _ = require('lodash');
var assert = require('assert');
var cheerio = require('cheerio');

var fs = require("fs");
var fsUtil = require("../lib/utils/fs");


describe('Glossary Generation', function () {
    it('should correctly replace glossary terms', function(done) {
        testGeneration(books[0], "website", function(output) {
            var content = fs.readFileSync(path.join(output, "index.html"), { encoding: "utf8" });
            var $ = cheerio.load(content);

            var $body = $(".page-inner");
            var $a = $("a[href='GLOSSARY.html#description']");
            assert($a.length == 1);
            assert($a.text() == "description");
        }, done);
    });

    it('should correctly replace glossary terms in sub pages', function(done) {
        testGeneration(books[1], "website", function(output) {
            var content = fs.readFileSync(path.join(output, "sub/test1.html"), { encoding: "utf8" });
            var $ = cheerio.load(content);

            var $body = $(".page-inner");
            var $a = $("a[href='../GLOSSARY.html#test']");
            assert($a.length == 1);
            assert($a.text() == "a test text");
        }, done);
    });
});
