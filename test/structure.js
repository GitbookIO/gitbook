var fs = require('fs');

var mock = require('./mock');
var WebsiteOutput = require('../lib/output/website');

/*

    Testing using configuration "structure" to use custom Readme/Summary/Glossary paths
*/

describe('Structure', function() {
    var output;

    before(function() {
        return mock.outputBook(WebsiteOutput, {
            'book.json': {
                structure: {
                    readme: 'intro.md'
                }
            },
            'SUMMARY.md': '* [Test](test.md)',
            'intro.md': 'This is the intro',
            'test.md': 'Go to [intro](intro.md)'
        })
        .then(function(_output) {
            output = _output;
        });
    });

    it('should generate index.html', function() {
        output.should.have.file('index.html');
    });

    it('should generate test.html', function() {
        output.should.have.file('test.html');
    });

    it('should correctly resolve link to Readme', function() {
        var readme = fs.readFileSync(output.resolve('test.html'), 'utf-8');

        readme.should.be.html({
            '.page-inner a': {
                count: 1,
                text: 'intro',
                attributes: {
                    href: './'
                }
            }
        });
    });
});
