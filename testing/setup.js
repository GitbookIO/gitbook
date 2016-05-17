var is = require('is');
var path = require('path');
var fs = require('fs');
var expect = require('expect');

expect.extend({
    /**
        Check that a file is created in a directory:

        expect('myFolder').toHaveFile('hello.md');
    */
    toHaveFile: function(fileName) {
        var filePath = path.join(this.actual, fileName);
        var exists = fs.existsSync(filePath);

        expect.assert(
            exists,
            'expected %s to have file %s',
            this.actual,
            fileName
        );
        return this;
    },
    toNotHaveFile: function(fileName) {
        var filePath = path.join(this.actual, fileName);
        var exists = fs.existsSync(filePath);

        expect.assert(
            !exists,
            'expected %s to not have file %s',
            this.actual,
            fileName
        );
        return this;
    },

    /**
        Check that a value is defined (not null nor undefined)
    */
    toBeDefined: function() {
        expect.assert(
            !(is.undefined(this.actual) || is.null(this.actual)),
            'expected to be defined'
        );
        return this;
    }
});

global.expect = expect;
