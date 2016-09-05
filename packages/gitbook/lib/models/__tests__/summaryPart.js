var SummaryPart = require('../summaryPart');

describe('SummaryPart', function() {
    describe('createChildLevel', function() {
        it('must create the right level', function() {
            var article = SummaryPart.create({}, '1');
            expect(article.createChildLevel()).toBe('1.1');
        });

        it('must create the right level when has articles', function() {
            var article = SummaryPart.create({
                articles: [
                    {
                        title: 'Test'
                    }
                ]
            }, '1');
            expect(article.createChildLevel()).toBe('1.2');
        });
    });
});


