var mock = require('./mock');
var WebsiteOutput = require('../lib/output/website');

describe('Website Output', function() {

    describe('Sample Book', function() {
        var output;

        before(function() {
            return mock.outputDefaultBook(WebsiteOutput)
            .then(function(_output) {
                output = _output;
            });
        });

        it('should correctly generate an index.html', function() {
            output.should.have.file('index.html');
        });

        it('should correctly copy assets', function() {
            output.should.have.file('gitbook/app.js');
            output.should.have.file('gitbook/images/favicon.ico');
        });

    });

    describe('Book with chapters', function() {
        var output;

        before(function() {
            return mock.outputDefaultBook(WebsiteOutput, {
                'hello/README.md': '# Hello',
                'hello/test.md': '# Test'
            }, [
                {
                    title: 'Hello',
                    path: 'hello/README.md'
                },
                {
                    title: 'Test',
                    path: 'hello/test.md'
                }
            ])
            .then(function(_output) {
                output = _output;
            });
        });

        it('should correctly generate an index.html', function() {
            output.should.have.file('index.html');
        });

        it('should correctly generate files in folder', function() {
            output.should.have.file('hello/index.html');
            output.should.have.file('hello/test.html');
        });

    });

});

