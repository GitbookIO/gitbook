const Summary = require('../../../models/summary');
const File = require('../../../models/file');

describe('editPartTitle', () => {
    const editPartTitle = require('../editPartTitle');
    const summary = Summary.createFromParts(new File(), [
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

    it('should correctly set title of first part', () => {
        const newSummary = editPartTitle(summary, 0, 'Hello World');
        const part = newSummary.getPart(0);

        expect(part.getTitle()).toBe('Hello World');
    });

    it('should correctly set title of second part', () => {
        const newSummary = editPartTitle(summary, 1, 'Hello');
        const part = newSummary.getPart(1);

        expect(part.getTitle()).toBe('Hello');
    });

    it('should not fail if part doesn\'t exist', () => {
        const newSummary = editPartTitle(summary, 3, 'Hello');
        expect(newSummary.getParts().size).toBe(2);
    });
});
