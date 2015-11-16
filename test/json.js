var fs = require('fs');
var path = require('path');

describe('JSON generator', function () {
    describe('Basic Book', function() {
        var book;

        before(function() {
            return books.generate('basic', 'json')
                .then(function(_book) {
                    book = _book;
                });
        });

        it('should correctly output a README.json', function() {
            book.should.have.file('README.json');
        });

        it('should output a valid json', function() {
            book.should.have.jsonfile('README.json');
        });

        describe('Page Format', function() {
            var page;

            before(function() {
                page = JSON.parse(
                    fs.readFileSync(
                        path.join(book.options.output, 'README.json'),
                        { encoding: 'utf-8' }
                    )
                );
            });

            it('should contains valid section', function() {
                page.should.have.property('sections').with.lengthOf(1);
                page.sections[0].should.have.property('content').which.is.a.String();
                page.sections[0].should.have.property('type', 'normal');
            });

            it('should contains valid progress', function() {
                page.should.have.property('progress');
                page.progress.should.have.property('chapters').with.lengthOf(1);
                page.progress.should.have.property('current');
            });

            it('should contains no languages', function() {
                page.should.have.property('langs').with.lengthOf(0);
            });
        });
    });

    describe('Multilingual Book', function() {
        var book;

        before(function() {
            return books.generate('languages', 'json')
                .then(function(_book) {
                    book = _book;
                });
        });

        it('should correctly output READMEs', function() {
            book.should.have.file('README.json');
            book.should.have.file('en/README.json');
            book.should.have.file('fr/README.json');
        });

        it('should output valid json', function() {
            book.should.have.jsonfile('README.json');
            book.should.have.jsonfile('en/README.json');
            book.should.have.jsonfile('fr/README.json');
        });

        describe('Page Format', function() {
            var page;

            before(function() {
                page = JSON.parse(
                    fs.readFileSync(
                        path.join(book.options.output, 'README.json'),
                        { encoding: 'utf-8' }
                    )
                );
            });

            it('should contains no languages', function() {
                page.should.have.property('langs').with.lengthOf(2);
            });
        });
    });
});
