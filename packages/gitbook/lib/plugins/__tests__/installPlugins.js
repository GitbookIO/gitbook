var path = require('path');

var Book = require('../../models/book');
var NodeFS = require('../../fs/node');
var installPlugins = require('../installPlugins');

var Parse = require('../../parse');

describe('installPlugins', function() {
    var book;

    this.timeout(30000);

    before(function() {
        var fs = NodeFS(path.resolve(__dirname, '../../../'));
        var baseBook = Book.createForFS(fs);

        return Parse.parseConfig(baseBook)
        .then(function(_book) {
            book = _book;
        });
    });

    it('must install all plugins from NPM', function() {
        return installPlugins(book)
        .then(function(n) {
            expect(n).toBe(2);
        });
    });
});
