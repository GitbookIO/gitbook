var mock = require('./mock');
var JSONOutput = require('../lib/output/json');

describe('JSON Output', function() {

    describe('Sample book', function() {
        var output;

        before(function() {
            return mock.outputDefaultBook(JSONOutput)
            .then(function(_output) {
                output = _output;
            });
        });

        it('should correctly generate a README.json', function() {
            output.should.have.file('README.json');
        });

    });

    describe('Multilingual Book', function() {
        var output;

        before(function() {
            return mock.outputBook(JSONOutput, {
                'LANGS.md': '# Languages\n\n'
                    + '* [en](./en)\n'
                    + '* [fr](./fr)\n\n',
                'en/README.md': '# Hello',
                'fr/README.md': '# Bonjour'

            })
            .then(function(_output) {
                output = _output;
            });
        });

        it('should correctly generate a README.json for each language', function() {
            output.should.have.file('en/README.json');
            output.should.have.file('fr/README.json');
        });

        it('should correctly add languages list to all json', function() {
            var jsonFR = require(output.resolve('fr/README.json'));
            var jsonEN = require(output.resolve('en/README.json'));

            jsonFR.should.have.property('languages')
                .with.property('list').with.lengthOf(2);
            jsonEN.should.have.property('languages')
                .with.property('list').with.lengthOf(2);
        });

        it('should correctly generate a README.json for the whole book', function() {
            output.should.have.file('README.json');

            var json = require(output.resolve('README.json'));

            json.should.have.property('languages')
                .with.property('list').with.lengthOf(2);
        });
    });
});

