var path = require('path');
var _ = require('lodash');
var assert = require('assert');

var fs = require('../lib/utils/fs');

describe('Book generation', function () {
    it('should correctly generate a book with json', function(done) {
    	var OUTPUT_PATH = book1.options.output;

        qdone(
        	book1.generate("json")
	        .fin(function() {
	        	return fs.remove(OUTPUT_PATH);
	        }), done);
    });
});
