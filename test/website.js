describe('Website generator', function () {
    describe('Basic Book', function() {
        var book;

        before(function() {
            return books.generate('basic', 'website')
                .then(function(_book) {
                    book = _book;
                });
        });

        it('should correctly output an index.html', function() {
            book.should.have.file('index.html');
        });

        it('should correctly copy assets', function() {
            book.should.have.file('gitbook');
            book.should.have.file('gitbook/app.js');
            book.should.have.file('gitbook/style.css');
        });

        it('should not copy ebook assets', function() {
            book.should.not.have.file('gitbook/ebook.css');
        });
    });
});
