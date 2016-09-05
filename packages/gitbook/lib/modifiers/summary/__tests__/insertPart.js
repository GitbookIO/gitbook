var Summary = require('../../../models/summary');
var SummaryPart = require('../../../models/summaryPart');

var File = require('../../../models/file');

describe('insertPart', function() {
    var insertPart = require('../insertPart');
    var summary = Summary.createFromParts(File(), [
        {
            articles: [
                {
                    title: '1.1',
                    path: '1.1'
                }
            ]
        },
        {
            title: 'Part I',
            articles: [
                {
                    title: '2.1',
                    path: '2.1',
                    articles: []
                },
                {
                    title: '2.2',
                    path: '2.2'
                }
            ]
        }
    ]);

    it('should insert an part at a given level', function() {
        var part = SummaryPart.create({
            title: 'Inserted'
        }, 'meaningless.level');

        var newSummary = insertPart(summary, part, 1);

        var inserted = newSummary.getPart(1);
        expect(inserted.getTitle()).toBe('Inserted');
        expect(newSummary.getParts().count()).toBe(3);

        var otherArticle = newSummary.getByLevel('3.1');
        expect(otherArticle.getTitle()).toBe('2.1');
        expect(otherArticle.getLevel()).toBe('3.1');
    });

    it('should insert an part in last position', function() {
        var part = SummaryPart.create({
            title: 'Inserted'
        }, 'meaningless.level');

        var newSummary = insertPart(summary, part, 2);

        var inserted = newSummary.getPart(2);
        expect(inserted.getTitle()).toBe('Inserted');
        expect(newSummary.getParts().count()).toBe(3);
    });
});
