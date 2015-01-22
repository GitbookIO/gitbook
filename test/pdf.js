var path = require('path');
var _ = require('lodash');
var assert = require('assert');

var fs = require("fs");
var fsUtil = require("../lib/utils/fs");


describe('PDF Generator', function () {
    it('should correctly generate a pdf', function(done) {
        testGeneration(books[1], "pdf", function(output) {
            assert(fs.existsSync(path.join(output, "book.pdf")));
        }, done);
    });
});
