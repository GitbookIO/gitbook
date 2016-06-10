var SummaryArticle = require('../summaryArticle');

describe('SummaryArticle', function() {
    describe('createChildLevel', function() {
        it('must create the right level', function() {
            var article = SummaryArticle.create({}, '1.1');
            expect(article.createChildLevel()).toBe('1.1.1');
        });

        it('must create the right level when has articles', function() {
            var article = SummaryArticle.create({
                articles: [
                    {
                        title: 'Test'
                    }
                ]
            }, '1.1');
            expect(article.createChildLevel()).toBe('1.1.2');
        });
    });
});


