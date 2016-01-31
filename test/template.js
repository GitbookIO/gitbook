var mock = require('./mock');
var TemplateEngine = require('../lib/template');

var pkg = require('../package.json');

describe('Template', function() {
    var book, tpl;

    before(function() {
        return mock.setupDefaultBook()
        .then(function(_book) {
            book = _book;
            return book.parse();
        })
        .then(function() {
            tpl = new TemplateEngine(book);
        });
    });

    describe('.renderString', function() {
        it('should render a simple string', function() {
            return tpl.renderString('Hello World')
                .should.be.fulfilledWith('Hello World');
        });

        it('should render with variable', function() {
            return tpl.renderString('Version is {{ gitbook.version }}')
                .should.be.fulfilledWith('Version is '+pkg.version);
        });
    });

});
