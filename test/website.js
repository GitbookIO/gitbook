var path = require('path');
var _ = require('lodash');
var assert = require('assert');

var fs = require("fs");
var fsUtil = require("../lib/utils/fs");


describe('Website Generator', function () {
    it('should correctly generate a book to website', function(done) {
        testGeneration(books[1], "site", function(output) {
            assert(fs.existsSync(path.join(output, "index.html")));
            assert(fs.existsSync(path.join(output, "search_index.json")));
        }, done);
    });

    it('should correctly include styles in website', function(done) {
        testGeneration(books[0], "site", function(output) {
            assert(fs.existsSync(path.join(output, "styles/website.css")));

            var INDEX = fs.readFileSync(path.join(output, "index.html")).toString();
            assert(INDEX.indexOf("styles/website.css") > 0);
        }, done);
    });

    it('should correctly include glossary in website', function(done) {
        testGeneration(books[0], "site", function(output) {
            assert(fs.existsSync(path.join(output, "GLOSSARY.html")));
        }, done);
    });

    it('should correctly generate a multilingual book to website', function(done) {
        testGeneration(books[2], "site", function(output) {
            assert(fs.existsSync(path.join(output, "index.html")));
            assert(fs.existsSync(path.join(output, "gitbook")));
            assert(fs.existsSync(path.join(output, "fr/index.html")));
            assert(fs.existsSync(path.join(output, "en/index.html")));
        }, done);
    });
});
