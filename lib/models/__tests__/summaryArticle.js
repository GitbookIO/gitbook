var SummaryArticle = require('../summaryArticle');
var File = require('../file');

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

    describe('isFile', function() {
        it('must return true when exactly the file', function() {
            var article = SummaryArticle.create({
                ref: 'hello.md'
            }, '1.1');
            var file = File.createWithFilepath('hello.md');

            expect(article.isFile(file)).toBe(true);
        });

        it('must return true when path is not normalized', function() {
            var article = SummaryArticle.create({
                ref: '/hello.md'
            }, '1.1');
            var file = File.createWithFilepath('hello.md');

            expect(article.isFile(file)).toBe(true);
        });

        it('must return false when has anchor', function() {
            var article = SummaryArticle.create({
                ref: 'hello.md#world'
            }, '1.1');
            var file = File.createWithFilepath('hello.md');

            expect(article.isFile(file)).toBe(false);
        });
    });
});


