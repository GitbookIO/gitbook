describe('Structure', function () {
    var book;

    before(function() {
        return books.parse('structure')
            .then(function(_book) {
                book = _book;
            });
    });


    it('should prioritize structure defined in book.json', function() {
        book.readmeFile.should.equal('README.adoc');
    });

    it('should be case incensitive', function() {
        book.glossaryFile.should.equal('glossary.md');
        book.glossary.should.have.lengthOf(1);
    });
});
