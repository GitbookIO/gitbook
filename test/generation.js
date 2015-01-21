var path = require('path');
var _ = require('lodash');
var assert = require('assert');

var fs = require("fs");
var fsUtil = require("../lib/utils/fs");

var testGeneration = function(book, type, func, done) {
    var OUTPUT_PATH = book.options.output;

    qdone(
        book.generate(type)
            .then(function() {
                func(OUTPUT_PATH);
            })
            .fin(function() {
                return fsUtil.remove(OUTPUT_PATH);
            }),
        done);
};


describe('Book generation', function () {
    it('should correctly generate a book to json', function(done) {
    	testGeneration(book1, "json", function(output) {
            assert(!fs.existsSync(path.join(output, "README.json")));
            assert(fs.existsSync(path.join(output, "intro.json")));
            assert(fs.existsSync(path.join(output, "sub/test1.json")));

            var test1 = JSON.parse(fs.readFileSync(path.join(output, "sub/test1.json")));
            assert(test1.sections[0].content.indexOf("intro.html") > 0);
        }, done);
    });

    it('should correctly generate an asciidoc book to json', function(done) {
        testGeneration(book3, "json", function(output) {
            assert(fs.existsSync(path.join(output, "README.json")));
            assert(fs.existsSync(path.join(output, "test.json")));
            assert(fs.existsSync(path.join(output, "test1.json")));
            assert(fs.existsSync(path.join(output, "test2.json")));
        }, done);
    });

    it('should correctly generate a multilingual book to json', function(done) {
    	testGeneration(book2, "json", function(output) {
            assert(fs.existsSync(path.join(output, "README.json")));
            assert(fs.existsSync(path.join(output, "en/README.json")));
            assert(fs.existsSync(path.join(output, "fr/README.json")));
        }, done);
    });

    it('should correctly generate a book to website', function(done) {
        testGeneration(book1, "site", function(output) {
            console.log(fs.readdirSync(output));
            assert(fs.existsSync(path.join(output, "index.html")));
        }, done);
    });
});
