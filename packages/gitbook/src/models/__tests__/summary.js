
describe('Summary', () => {
    const File = require('../file');
    const Summary = require('../summary');

    const summary = Summary.createFromParts(File(), [
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

    describe('createFromEntries', () => {
        it('must add all parts', () => {
            const parts = summary.getParts();
            expect(parts.size).toBe(2);
        });
    });

    describe('getByLevel', () => {
        it('can return a Part', () => {
            const part = summary.getByLevel('1');

            expect(part).toBeDefined();
            expect(part.getArticles().size).toBe(4);
        });

        it('can return a Part (2)', () => {
            const part = summary.getByLevel('2');

            expect(part).toBeDefined();
            expect(part.getTitle()).toBe('Test');
            expect(part.getArticles().size).toBe(0);
        });

        it('can return an Article', () => {
            const article = summary.getByLevel('1.1');

            expect(article).toBeDefined();
            expect(article.getTitle()).toBe('My First Article');
        });
    });

    describe('getByPath', () => {
        it('return correct article', () => {
            const article = summary.getByPath('README.md');

            expect(article).toBeDefined();
            expect(article.getTitle()).toBe('My First Article');
        });

        it('return correct article', () => {
            const article = summary.getByPath('article.md');

            expect(article).toBeDefined();
            expect(article.getTitle()).toBe('My Second Article');
        });

        it('return undefined if not found', () => {
            const article = summary.getByPath('NOT_EXISTING.md');

            expect(article).toBeFalsy();
        });
    });

    describe('toText', () => {
        it('return as markdown', () => {
            return summary.toText('.md')
            .then((text) => {
                expect(text).toContain('# Summary');
            });
        });
    });
});

