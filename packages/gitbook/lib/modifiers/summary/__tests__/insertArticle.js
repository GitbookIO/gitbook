var Summary = require('../../../models/summary');
var SummaryArticle = require('../../../models/summaryArticle');
var File = require('../../../models/file');

describe('insertArticle', function() {
    var insertArticle = require('../insertArticle');
    var summary = Summary.createFromParts(File(), [
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

    it('should insert an article at a given level', function() {
        var article = SummaryArticle.create({
            title: 'Inserted'
        }, 'fake.level');

        var newSummary = insertArticle(summary, article, '2.1.1');

        var inserted = newSummary.getByLevel('2.1.1');
        var nextOne = newSummary.getByLevel('2.1.2');

        expect(inserted.getTitle()).toBe('Inserted');
        expect(inserted.getLevel()).toBe('2.1.1');

        expect(nextOne.getTitle()).toBe('2.1.1');
        expect(nextOne.getLevel()).toBe('2.1.2');
    });

    it('should insert an article in last position', function() {
        var article = SummaryArticle.create({
            title: 'Inserted'
        }, 'fake.level');

        var newSummary = insertArticle(summary, article, '2.2');

        var inserted = newSummary.getByLevel('2.2');
        var previousOne = newSummary.getByLevel('2.1');

        expect(inserted.getTitle()).toBe('Inserted');
        expect(inserted.getLevel()).toBe('2.2');

        expect(previousOne.getTitle()).toBe('2.1'); // Unchanged
        expect(previousOne.getLevel()).toBe('2.1');
    });
});
