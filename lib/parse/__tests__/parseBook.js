var Book = require('../../models/book');
var createMockFS = require('../../fs/mock');

describe('parseBook', function() {
    var parseBook = require('../parseBook');

    pit('should parse glossary if exists', function() {
        var fs = createMockFS({
            'README.md': 'Hello World',
            'GLOSSARY.md': '# Glossary\n\n## Hello\nDescription for hello'
        });
        var book = Book.createForFS(fs);

        return parseBook(book)
        .then(function(resultBook) {

        });
    });
});
