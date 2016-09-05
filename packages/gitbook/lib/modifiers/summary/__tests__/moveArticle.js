var Immutable = require('immutable');
var Summary = require('../../../models/summary');
var File = require('../../../models/file');

describe('moveArticle', function() {
    var moveArticle = require('../moveArticle');
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

    it('should move an article to the same place', function() {
        var newSummary = moveArticle(summary, '2.1', '2.1');

        expect(Immutable.is(summary, newSummary)).toBe(true);
    });

    it('should move an article to an previous level', function() {
        var newSummary = moveArticle(summary, '2.2', '2.1');
        var moved = newSummary.getByLevel('2.1');
        var other = newSummary.getByLevel('2.2');

        expect(moved.getTitle()).toBe('2.2');
        expect(other.getTitle()).toBe('2.1');
    });

    it('should move an article to a next level', function() {
        var newSummary = moveArticle(summary, '2.1', '2.2');
        var moved = newSummary.getByLevel('2.1');
        var other = newSummary.getByLevel('2.2');

        expect(moved.getTitle()).toBe('2.2');
        expect(other.getTitle()).toBe('2.1');
    });
});
