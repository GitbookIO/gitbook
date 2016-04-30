var TemplateEngine = require('../../models/templateEngine');
var renderTemplate = require('../render');

describe('ConrefsLoader', function() {
    var ConrefsLoader = require('../conrefsLoader');

    var engine = TemplateEngine({
        loader: new ConrefsLoader(__dirname)
    });

    describe('Git', function() {
        pit('should include content from git', function() {
            return renderTemplate(engine, 'test.md', '{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test.md" %}')
            .then(function(str) {
                expect(str).toBe('Hello from git');
            });
        });

        pit('should handle deep inclusion (1)', function() {
            return renderTemplate(engine, 'test.md', '{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test2.md" %}')
            .then(function(str) {
                expect(str).toBe('First Hello. Hello from git');
            });
        });

        pit('should handle deep inclusion (2)', function() {
            return renderTemplate(engine, 'test.md', '{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test3.md" %}')
            .then(function(str) {
                expect(str).toBe('First Hello. Hello from git');
            });
        });
    });
});

