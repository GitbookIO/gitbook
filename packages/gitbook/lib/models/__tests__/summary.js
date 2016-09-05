
describe('Summary', function() {
    var File = require('../file');
    var Summary = require('../summary');

    var summary = Summary.createFromParts(File(), [
        {
            articles: [
                {
                    title: 'My First Article',
                    ref: 'README.md'
                },
                {
                    title: 'My Second Article',
                    ref: 'article.md'
                },
                {
                    title: 'Article without ref'
                },
                {
                    title: 'Article with absolute ref',
                    ref: 'https://google.fr'
                }
            ]
        },
        {
            title: 'Test'
        }
    ]);

    describe('createFromEntries', function() {
        it('must add all parts', function() {
            var parts = summary.getParts();
            expect(parts.size).toBe(2);
        });
    });

    describe('getByLevel', function() {
        it('can return a Part', function() {
            var part = summary.getByLevel('1');

            expect(part).toBeDefined();
            expect(part.getArticles().size).toBe(4);
        });

        it('can return a Part (2)', function() {
            var part = summary.getByLevel('2');

            expect(part).toBeDefined();
            expect(part.getTitle()).toBe('Test');
            expect(part.getArticles().size).toBe(0);
        });

        it('can return an Article', function() {
            var article = summary.getByLevel('1.1');

            expect(article).toBeDefined();
            expect(article.getTitle()).toBe('My First Article');
        });
    });

    describe('getByPath', function() {
        it('return correct article', function() {
            var article = summary.getByPath('README.md');

            expect(article).toBeDefined();
            expect(article.getTitle()).toBe('My First Article');
        });

        it('return correct article', function() {
            var article = summary.getByPath('article.md');

            expect(article).toBeDefined();
            expect(article.getTitle()).toBe('My Second Article');
        });

        it('return undefined if not found', function() {
            var article = summary.getByPath('NOT_EXISTING.md');

            expect(article).toBeFalsy();
        });
    });

    describe('toText', function() {
        it('return as markdown', function() {
            return summary.toText('.md')
            .then(function(text) {
                expect(text).toContain('# Summary');
            });
        });
    });
});


