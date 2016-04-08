var mock = require('./mock');
var WebsiteOutput = require('../lib/output/website');

describe('Ignore', function() {
    var output;

    before(function() {
        return mock.outputDefaultBook(WebsiteOutput, {
            '.ignore': 'test-1.js',
            '.gitignore': 'test-2.js\ntest-3.js',
            '.bookignore': '!test-3.js',
            'test-1.js': '1',
            'test-2.js': '2',
            'test-3.js': '3'
        })
        .then(function(_output) {
            output = _output;
        });
    });

    it('should load rules from .ignore', function() {
        output.should.not.have.file('test-1.js');
    });

    it('should load rules from .gitignore', function() {
        output.should.not.have.file('test-2.js');
    });

    it('should load rules from .bookignore', function() {
        output.should.have.file('test-3.js');
    });
});

