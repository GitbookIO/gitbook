var mock = require('./mock');

describe('JSON Output', function() {

    describe('Sample book', function() {
        var output;

        before(function() {
            return mock.outputDefaultBook('json')
            .then(function(_output) {
                output = _output;
            });
        });

        it('should correctly generate a README.json', function() {
            output.should.have.file('README.json');
        });

    });
});

