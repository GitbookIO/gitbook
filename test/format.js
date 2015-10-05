describe('Formatting', function () {
    it('should provide formatting with book.formatString', function() {
        return books.parse('basic')
        .then(function(book) {
            return book.formatString('markdown', 'this is a **test**');
        })
        .then(function(content) {
            content.should.equal('<p>this is a <strong>test</strong></p>\n');
        });
    });
});
