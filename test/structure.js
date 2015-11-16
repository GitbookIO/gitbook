describe('Structure', function () {
    it('should prioritize structure defined in book.json', function() {
        return books.parse('structure')
            .then(function(book) {
                book.readmeFile.should.equal('README.adoc');
            });
    });
});
