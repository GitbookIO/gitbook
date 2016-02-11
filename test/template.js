var mock = require('./mock');
var pkg = require('../package.json');

describe('Template', function() {
    var book;

    before(function() {
        return mock.setupDefaultBook({
            'test.md': 'World'
        })
        .then(function(_book) {
            book = _book;
            return book.parse();
        });
    });

    describe('.renderString', function() {
        it('should render a simple string', function() {
            return book.template.renderString('Hello World')
                .should.be.fulfilledWith('Hello World');
        });

        it('should render with variable', function() {
            return book.template.renderString('Version is {{ gitbook.version }}')
                .should.be.fulfilledWith('Version is '+pkg.version);
        });
    });

    describe('Conrefs Loader', function() {
        it('should include a local file', function() {
            return book.template.renderString('Hello {% include "./test.md" %}')
                .should.be.fulfilledWith('Hello World');
        });

        it('should include a git url', function() {
            return book.template.renderString('Hello {% include "./test.md" %}')
                .should.be.fulfilledWith('Hello World');
        });

        it('should reject file out of scope', function() {
            return book.template.renderString('Hello {% include "../test.md" %}')
                .should.be.rejected();
        });

        describe('Git Urls', function() {
            it('should include a file from a git repo', function() {
                return book.template.renderString('{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test.md" %}')
                    .should.be.fulfilledWith('Hello from git');
            });

            it('should handle deep inclusion (1)', function() {
                return book.template.renderString('{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test2.md" %}')
                    .should.be.fulfilledWith('First Hello. Hello from git');
            });

            it('should handle deep inclusion (2)', function() {
                return book.template.renderString('{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test3.md" %}')
                    .should.be.fulfilledWith('First Hello. Hello from git');
            });
        });
    });

});
