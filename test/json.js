var path = require('path');
var _ = require('lodash');
var assert = require('assert');

var fs = require("fs");

describe('JSON generator', function () {
    it('should correctly generate a book to json with glossary', function(done) {
        testGeneration(books[0], "json", function(output) {
            assert(fs.existsSync(path.join(output, "README.json")));

            var readme = JSON.parse(fs.readFileSync(path.join(output, "README.json")));
            assert(readme.sections[0].content.indexOf('class="glossary-term"') > 0);
        }, done);
    });

    it('should correctly generate a book to json with sub folders', function(done) {
    	testGeneration(books[1], "json", function(output) {
            assert(!fs.existsSync(path.join(output, "README.json")));
            assert(fs.existsSync(path.join(output, "intro.json")));
            assert(fs.existsSync(path.join(output, "sub/test1.json")));

            var test1 = JSON.parse(fs.readFileSync(path.join(output, "sub/test1.json")));
            assert(test1.sections[0].content.indexOf("intro.html") > 0);
        }, done);
    });

    it('should correctly generate a multilingual book to json', function(done) {
    	testGeneration(books[2], "json", function(output) {
            assert(fs.existsSync(path.join(output, "README.json")));
            assert(fs.existsSync(path.join(output, "en/README.json")));
            assert(fs.existsSync(path.join(output, "fr/README.json")));
        }, done);
    });

    it('should correctly generate an asciidoc book to json', function(done) {
        testGeneration(books[3], "json", function(output) {
            assert(fs.existsSync(path.join(output, "README.json")));
            assert(fs.existsSync(path.join(output, "test.json")));
            assert(fs.existsSync(path.join(output, "test1.json")));
            assert(fs.existsSync(path.join(output, "test2.json")));
        }, done);
    });

    it('should correctly generate a book with inclusion', function(done) {
        testGeneration(books[5], "json", function(output) {
            assert(fs.existsSync(path.join(output, "README.json")));

            var readme = JSON.parse(fs.readFileSync(path.join(output, "README.json")));
            assert(readme.sections[0].content.indexOf('Hello World') > 0);
        }, done);
    });
});
