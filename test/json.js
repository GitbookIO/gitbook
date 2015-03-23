
describe('JSON generator', function () {
    it('should correctly generate a basic book to json', function() {
        return books.generate("basic", "json")
            .then(function(book) {

            });
    });
});
