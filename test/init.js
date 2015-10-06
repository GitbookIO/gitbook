var fs = require('fs');
var path = require('path');
var should = require('should');

var Book = require('../').Book;
var LOG_LEVELS = require('../').LOG_LEVELS;

describe('Init Books', function () {
    var initRoot;

    before(function() {
        initRoot = path.resolve(__dirname, 'books/init');
        return Book.init(initRoot, {
            logLevel: LOG_LEVELS.DISABLED
        });
    });

    it('should create all chapters', function() {
        should(fs.existsSync(path.resolve(initRoot, 'hello.md'))).be.ok();
        should(fs.existsSync(path.resolve(initRoot, 'hello2.md'))).be.ok();
        should(fs.existsSync(path.resolve(initRoot, 'hello3/hello4.md'))).be.ok();
        should(fs.existsSync(path.resolve(initRoot, 'hello3/hello5/hello6.md'))).be.ok();
    });
});
