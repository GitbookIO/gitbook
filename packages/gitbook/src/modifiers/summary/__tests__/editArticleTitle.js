const Summary = require('../../../models/summary');

describe('editArticleTitle', () => {
    const editArticleTitle = require('../editArticleTitle');
    const summary = Summary.createFromParts([
        {
            articles: [
                {
                    title: 'My First Article',
                    path: 'README.md'
                },
                {
                    title: 'My Second Article',
                    path: 'article.md'
                }
            ]
        },
        {
            title: 'Test'
        }
    ]);

    it('should correctly set title of first article', () => {
        const newSummary = editArticleTitle(summary, '1.1', 'Hello World');
        const article = newSummary.getByLevel('1.1');

        expect(article.getTitle()).toBe('Hello World');
    });

    it('should correctly set title of second article', () => {
        const newSummary = editArticleTitle(summary, '1.2', 'Hello World');
        const article = newSummary.getByLevel('1.2');

        expect(article.getTitle()).toBe('Hello World');
    });
});
