var mock = require('./mock');
var AssetsInliner = require('../lib/output/assets-inliner');

describe('Assets Inliner Output', function() {

    describe('SVG', function() {
        var output;

        before(function() {
            return mock.outputDefaultBook(AssetsInliner, {
                'README.md': '![image](test.svg)',
                'test.svg': '<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" /></svg>'
            })
            .then(function(_output) {
                output = _output;
            });
        });

        it('should correctly convert to PNG', function() {
            var readme = output.book.getPage('README.md');
            console.log(readme.content)
        });

    });
});

