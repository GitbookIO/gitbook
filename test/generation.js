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
            assert(fs.existsSync(path.join(output, "intro.json")))
        }, done);
    });

    it('should correctly generate a multilingual book to json', function(done) {
    	testGeneration(book2, "json", function(output) {

        }, done);
    });
});
