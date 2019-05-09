var fs = require('fs');
var generateMock = require('./generateMock');
var WebsiteGenerator = require('../website');

describe('WebsiteGenerator', function() {

    it('should generate an index.html', function() {
        return generateMock(WebsiteGenerator, {
            'README.md': 'Hello World'
        })
        .then(function(folder) {
            expect(folder).toHaveFile('index.html');
        });
    });

    describe('Glossary', function() {
        var folder;

        before(function() {
            return generateMock(WebsiteGenerator, {
                'README.md': 'Hello World',
                'SUMMARY.md': '* [Deep](folder/page.md)',
                'folder': {
                    'page.md': 'Hello World'
                },
                'GLOSSARY.md': '# Glossary\n\n## Hello\n\nHello World'
            })
            .then(function(_folder) {
                folder = _folder;
            });
        });

        it('should generate a GLOSSARY.html', function() {
            expect(folder).toHaveFile('GLOSSARY.html');
        });

        it('should correctly resolve glossary links in README', function() {
            var html = fs.readFileSync(folder + '/index.html', 'utf8');
            expect(html).toHaveDOMElement('.page-inner a[href="GLOSSARY.html#hello"]');
        });

        it('should correctly resolve glossary links in directory', function() {
            var html = fs.readFileSync(folder + '/folder/page.html', 'utf8');
            expect(html).toHaveDOMElement('.page-inner a[href="../GLOSSARY.html#hello"]');
        });

        it('should accept a custom glossary file', function() {
            return generateMock(WebsiteGenerator, {
                'README.md': 'Hello World',
                'book.json': '{ "structure": { "glossary": "custom.md" } }',
                'custom.md': '# Glossary\n\n## Hello\n\nHello World'
            })
            .then(function(folder) {
                expect(folder).toHaveFile('custom.html');
                expect(folder).toNotHaveFile('GLOSSARY.html');

                var html = fs.readFileSync(folder + '/index.html', 'utf8');
                expect(html).toHaveDOMElement('.page-inner a[href="custom.html#hello"]');
            });
        });
    });


    it('should copy asset files', function() {
        return generateMock(WebsiteGenerator, {
            'README.md': 'Hello World',
            'myJsFile.js': 'var a = "test";',
            'folder': {
                'AnotherAssetFile.md': '# Even md'
            }
        })
        .then(function(folder) {
            expect(folder).toHaveFile('index.html');
            expect(folder).toHaveFile('myJsFile.js');
            expect(folder).toHaveFile('folder/AnotherAssetFile.md');
        });
    });

    it('should generate an index.html for AsciiDoc', function() {
        return generateMock(WebsiteGenerator, {
            'README.adoc': 'Hello World'
        })
        .then(function(folder) {
            expect(folder).toHaveFile('index.html');
        });
    });

    it('should generate an HTML file for each articles', function() {
        return generateMock(WebsiteGenerator, {
            'README.md': 'Hello World',
            'SUMMARY.md': '# Summary\n\n* [Page](test/page.md)',
            'test': {
                'page.md': 'Hello 2'
            }
        })
        .then(function(folder) {
            expect(folder).toHaveFile('index.html');
            expect(folder).toHaveFile('test/page.html');
        });
    });

    it('should not generate file if entry file doesn\'t exist', function() {
        return generateMock(WebsiteGenerator, {
            'README.md': 'Hello World',
            'SUMMARY.md': '# Summary\n\n* [Page 1](page.md)\n* [Page 2](test/page.md)',
            'test': {
                'page.md': 'Hello 2'
            }
        })
        .then(function(folder) {
            expect(folder).toHaveFile('index.html');
            expect(folder).toNotHaveFile('page.html');
            expect(folder).toHaveFile('test/page.html');
        });
    });

    it('should generate a multilingual book', function() {
        return generateMock(WebsiteGenerator, {
            'LANGS.md': '# Languages\n\n* [en](en)\n* [fr](fr)',
            'en': {
                'README.md': 'Hello'
            },
            'fr': {
                'README.md': 'Bonjour'
            }
        })
        .then(function(folder) {
            // It should generate languages
            expect(folder).toHaveFile('en/index.html');
            expect(folder).toHaveFile('fr/index.html');

            // Should not copy languages as assets
            expect(folder).toNotHaveFile('en/README.md');
            expect(folder).toNotHaveFile('fr/README.md');

            // Should copy assets only once
            expect(folder).toHaveFile('gitbook/style.css');
            expect(folder).toNotHaveFile('en/gitbook/style.css');

            expect(folder).toHaveFile('index.html');
        });
    });
});

