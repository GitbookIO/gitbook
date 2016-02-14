var mock = require('./mock');
var pkg = require('../package.json');
var Output = require('../lib/output/base');

describe('Template', function() {
    var output;

    before(function() {
        return mock.outputDefaultBook(Output, {
            'test.md': 'World'
        })
        .then(function(_output) {
            output = _output;
        });
    });

    describe('.renderString', function() {
        it('should render a simple string', function() {
            return output.template.renderString('Hello World')
                .should.be.fulfilledWith('Hello World');
        });

        it('should render with variable', function() {
            return output.template.renderString('Version is {{ gitbook.version }}')
                .should.be.fulfilledWith('Version is '+pkg.version);
        });
    });
});
