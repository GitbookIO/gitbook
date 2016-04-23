jest.autoMockOff();

describe('Summary', function() {
    var File = require('../file');
    var Summary = require('../summary');

    describe('createFromEntries', function() {
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

        it('must add all parts', function() {
            var parts = summary.getParts();
            expect(parts.size).toBe(2);
        });

        it('must index by level', function() {
            var part1 = summary.getByLevel('0');

            expect(part1).toBeDefined();
            expect(part1.getArticles().size).toBe(2);
        });
    });
});


