var path = require('path');

var TemplateEngine = require('../../models/templateEngine');
var renderTemplate = require('../render');
var ConrefsLoader = require('../conrefsLoader');

describe('ConrefsLoader', function() {
    var dirName = __dirname + '/';
    var fileName = path.join(dirName, 'test.md');

    console.log(dirName);
    describe('Git', function() {
        var engine = TemplateEngine({
            loader: new ConrefsLoader(dirName)
        });

        it('should include content from git', function() {
            return renderTemplate(engine, fileName, '{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test.md" %}')
            .then(function(out) {
                expect(out.getContent()).toBe('Hello from git');
            });
        });

        it('should handle deep inclusion (1)', function() {
            return renderTemplate(engine, fileName, '{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test2.md" %}')
            .then(function(out) {
                expect(out.getContent()).toBe('First Hello. Hello from git');
            });
        });

        it('should handle deep inclusion (2)', function() {
            return renderTemplate(engine, fileName, '{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test3.md" %}')
            .then(function(out) {
                expect(out.getContent()).toBe('First Hello. Hello from git');
            });
        });
    });

    describe('transform', function() {
        function transform(filePath, source) {
            return 'test-' + source + '-endtest';
        }
        var engine = TemplateEngine({
            loader: new ConrefsLoader(dirName, transform)
        });

        it('should transform included content', function() {
            return renderTemplate(engine, fileName, '{% include "include.md" %}')
            .then(function(out) {
                expect(out.getContent()).toBe('test-Hello World-endtest');
            });
        });
    });
});

