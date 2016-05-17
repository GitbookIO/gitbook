var Summary = require('../../../models/summary');
var File = require('../../../models/file');

describe('editPartTitle', function() {
    var editPartTitle = require('../editPartTitle');
    var summary = Summary.createFromParts(File(), [
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

    it('should correctly set title of first part', function() {
        var newSummary = editPartTitle(summary, 0, 'Hello World');
        var part = newSummary.getPart(0);

        expect(part.getTitle()).toBe('Hello World');
    });

    it('should correctly set title of second part', function() {
        var newSummary = editPartTitle(summary, 1, 'Hello');
        var part = newSummary.getPart(1);

        expect(part.getTitle()).toBe('Hello');
    });

    it('should not fail if part doesn\'t exist', function() {
        var newSummary = editPartTitle(summary, 3, 'Hello');
        expect(newSummary.getParts().size).toBe(2);
    });
});


