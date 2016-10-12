const generateMock = require('./generateMock');
const WebsiteGenerator = require('../website');

describe('WebsiteGenerator', () => {

    it('should generate an index.html', () => {
        return generateMock(WebsiteGenerator, {
            'README.md': 'Hello World'
        })
        .then((folder) => {
            expect(folder).toHaveFile('index.html');
        });
    });

    describe('Glossary', () => {
        let folder;

        before(() => {
            return generateMock(WebsiteGenerator, {
                'README.md': 'Hello World',
                'SUMMARY.md': '* [Deep](folder/page.md)',
                'folder': {
                    'page.md': 'Hello World'
                },
                'GLOSSARY.md': '# Glossary\n\n## Hello\n\nHello World'
            })
            .then((_folder) => {
                folder = _folder;
            });
        });

        it('should generate a GLOSSARY.html', () => {
            expect(folder).toHaveFile('GLOSSARY.html');
        });

        it('should accept a custom glossary file', () => {
            return generateMock(WebsiteGenerator, {
                'README.md': 'Hello World',
                'book.json': '{ "structure": { "glossary": "custom.md" } }',
                'custom.md': '# Glossary\n\n## Hello\n\nHello World'
            })
            .then((result) => {
                expect(result).toHaveFile('custom.html');
                expect(result).toNotHaveFile('GLOSSARY.html');
            });
        });
    });


    it('should copy asset files', () => {
        return generateMock(WebsiteGenerator, {
            'README.md': 'Hello World',
            'myJsFile.js': 'var a = "test";',
            'folder': {
                'AnotherAssetFile.md': '# Even md'
            }
        })
        .then((folder) => {
            expect(folder).toHaveFile('index.html');
            expect(folder).toHaveFile('myJsFile.js');
            expect(folder).toHaveFile('folder/AnotherAssetFile.md');
        });
    });

    it('should generate an index.html for AsciiDoc', () => {
        return generateMock(WebsiteGenerator, {
            'README.adoc': 'Hello World'
        })
        .then(function(folder) {
            expect(folder).toHaveFile('index.html');
        });
    });

    it('should generate an HTML file for each articles', () => {
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

    it('should not generate file if entry file doesn\'t exist', () => {
        return generateMock(WebsiteGenerator, {
            'README.md': 'Hello World',
            'SUMMARY.md': '# Summary\n\n* [Page 1](page.md)\n* [Page 2](test/page.md)',
            'test': {
                'page.md': 'Hello 2'
            }
        })
        .then((folder) => {
            expect(folder).toHaveFile('index.html');
            expect(folder).toNotHaveFile('page.html');
            expect(folder).toHaveFile('test/page.html');
        });
    });

    it('should generate a multilingual book', () => {
        return generateMock(WebsiteGenerator, {
            'LANGS.md': '# Languages\n\n* [en](en)\n* [fr](fr)',
            'en': {
                'README.md': 'Hello'
            },
            'fr': {
                'README.md': 'Bonjour'
            }
        })
        .then((folder) => {
            // It should generate languages
            expect(folder).toHaveFile('en/index.html');
            expect(folder).toHaveFile('fr/index.html');

            // Should not copy languages as assets
            expect(folder).toNotHaveFile('en/README.md');
            expect(folder).toNotHaveFile('fr/README.md');

            // Should copy assets only once
            expect(folder).toHaveFile('gitbook/core.js');
            expect(folder).toNotHaveFile('en/gitbook/core.js');

            expect(folder).toHaveFile('index.html');
        });
    });
});
