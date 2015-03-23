
describe('JSON generator', function () {
    describe('Basic Book', function() {
        it('should correctly output a README.json', function() {
            return books.generate("basic", "json")
                .then(function(book) {
                    book.should.have.file("README.json");
                });
        });
    });
});
