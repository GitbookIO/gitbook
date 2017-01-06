const Summary = require('../../../models/summary');
const SummaryArticle = require('../../../models/summaryArticle');

describe('insertArticle', () => {
    const insertArticle = require('../insertArticle');
    const summary = Summary.createFromParts([
        {
            articles: [
                {
                    title: '1.1',
                    path: '1.1'
                },
                {
                    title: '1.2',
                    path: '1.2'
                }
            ]
        },
        {
            title: 'Part I',
            articles: [
                {
                    title: '2.1',
                    path: '2.1',
                    articles: [
                        {
                            title: '2.1.1',
                            path: '2.1.1'
                        },
                        {
                            title: '2.1.2',
                            path: '2.1.2'
                        }
                    ]
                },
                {
                    title: '2.2',
                    path: '2.2'
                }
            ]
        }
    ]);

    it('should insert an article at a given level', () => {
        const article = SummaryArticle.create({
            title: 'Inserted'
        }, 'fake.level');

        const newSummary = insertArticle(summary, article, '2.1.1');

        const inserted = newSummary.getByLevel('2.1.1');
        const nextOne = newSummary.getByLevel('2.1.2');

        expect(inserted.getTitle()).toBe('Inserted');
        expect(inserted.getLevel()).toBe('2.1.1');

        expect(nextOne.getTitle()).toBe('2.1.1');
        expect(nextOne.getLevel()).toBe('2.1.2');
    });

    it('should insert an article in last position', () => {
        const article = SummaryArticle.create({
            title: 'Inserted'
        }, 'fake.level');

        const newSummary = insertArticle(summary, article, '2.2');

        const inserted = newSummary.getByLevel('2.2');
        const previousOne = newSummary.getByLevel('2.1');

        expect(inserted.getTitle()).toBe('Inserted');
        expect(inserted.getLevel()).toBe('2.2');

        expect(previousOne.getTitle()).toBe('2.1'); // Unchanged
        expect(previousOne.getLevel()).toBe('2.1');
    });
});
