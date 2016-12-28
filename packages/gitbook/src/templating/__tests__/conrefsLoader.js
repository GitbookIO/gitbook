const path = require('path');

const TemplateEngine = require('../../models/templateEngine');
const renderTemplate = require('../render');
const ConrefsLoader = require('../conrefsLoader');

describe('ConrefsLoader', () => {
    const dirName = __dirname + '/';
    const fileName = path.join(dirName, 'test.md');

    describe('Git', () => {
        let engine;

        before(() => {
            engine = new TemplateEngine({
                loader: new ConrefsLoader(dirName)
            });
        });

        it('should include content from git', () => {
            return renderTemplate(engine, fileName, '{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test.md" %}')
            .then((out) => {
                expect(out).toBe('Hello from git');
            });
        });

        it('should handle deep inclusion (1)', () => {
            return renderTemplate(engine, fileName, '{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test2.md" %}')
            .then((out) => {
                expect(out).toBe('First Hello. Hello from git');
            });
        });

        it('should handle deep inclusion (2)', () => {
            return renderTemplate(engine, fileName, '{% include "git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test3.md" %}')
            .then((out) => {
                expect(out).toBe('First Hello. Hello from git');
            });
        });
    });

    describe('Local', () => {
        let engine;

        before(() => {
            engine = new TemplateEngine({
                loader: new ConrefsLoader(dirName)
            });
        });

        describe('Relative', () => {
            it('should resolve basic relative filepath', () => {
                return renderTemplate(engine, fileName, '{% include "include.md" %}')
                .then((out) => {
                    expect(out).toBe('Hello World');
                });
            });

            it('should resolve basic parent filepath', () => {
                return renderTemplate(engine, path.join(dirName, 'hello/test.md'), '{% include "../include.md" %}')
                .then((out) => {
                    expect(out).toBe('Hello World');
                });
            });
        });

        describe('Absolute', () => {
            it('should resolve absolute filepath', () => {
                return renderTemplate(engine, fileName, '{% include "/include.md" %}')
                .then((out) => {
                    expect(out).toBe('Hello World');
                });
            });

            it('should resolve absolute filepath when in a directory', () => {
                return renderTemplate(engine, path.join(dirName, 'hello/test.md'), '{% include "/include.md" %}')
                .then((out) => {
                    expect(out).toBe('Hello World');
                });
            });
        });

    });

    describe('transform', () => {
        function transform(filePath, source) {
            expect(filePath).toBeA('string');
            expect(source).toBeA('string');

            expect(filePath).toBe(path.resolve(__dirname, 'include.md'));
            expect(source).toBe('Hello World');

            return 'test-' + source + '-endtest';
        }

        let engine;

        before(() => {
            engine = new TemplateEngine({
                loader: new ConrefsLoader(dirName, transform)
            });
        });

        it('should transform included content', () => {
            return renderTemplate(engine, fileName, '{% include "include.md" %}')
            .then((out) => {
                expect(out).toBe('test-Hello World-endtest');
            });
        });
    });
});
