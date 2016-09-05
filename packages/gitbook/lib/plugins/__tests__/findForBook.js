var path = require('path');

var Book = require('../../models/book');
var createNodeFS = require('../../fs/node');
var findForBook = require('../findForBook');

describe('findForBook', function() {
    var fs = createNodeFS(
        path.resolve(__dirname, '../../..')
    );
    var book = Book.createForFS(fs);

    it('should list default plugins', function() {
        return findForBook(book)
        .then(function(plugins) {
            expect(plugins.has('fontsettings')).toBeTruthy();
        });
    });
});
