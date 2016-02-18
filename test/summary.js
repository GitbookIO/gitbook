var should = require('should');

var mock = require('./mock');

describe('Summary / Table of contents', function() {
    describe('Empty summary list', function() {
        var book;

        before(function() {
            return mock.setupDefaultBook({})
            .then(function(_book) {
                book = _book;
                return book.summary.load();
            });
        });

        it('should correctly count articles', function() {
            book.summary.count().should.equal(1);
        });
    });

    describe('Non-empty summary list', function() {
        var book;

        before(function() {
            return mock.setupDefaultBook({
                'SUMMARY.md': '# Summary\n\n'
                    + '* [Hello](./hello.md)\n'
                    + '* [World](./world.md)\n\n'
            })
            .then(function(_book) {
                book = _book;
                return book.summary.load();
            });
        });

        it('should correctly count articles', function() {
            book.summary.count().should.equal(3);
        });
    });

    describe('External', function() {
        var book;

        before(function() {
            return mock.setupDefaultBook({}, [
                {
                    title: 'Google',
                    path: 'https://www.google.fr'
                }
            ])
            .then(function(_book) {
                book = _book;
                return book.summary.load();
            });
        });

        it('should correctly count articles', function() {
            book.summary.count().should.equal(2);
        });

        it('should correctly signal it as external', function() {
            var article = book.summary.getArticleByLevel('1');

            should(article).be.ok();
            should(article.path).not.be.ok();

            article.title.should.equal('Google');
            article.ref.should.equal('https:/www.google.fr');
            article.isExternal().should.be.ok;
        });
    });

    describe('Next / Previous', function() {
        var book;

        before(function() {
            return mock.setupDefaultBook({
                'SUMMARY.md': '# Summary\n\n' +
                    '* [Hello](hello.md)\n' +
                    '* [Hello 2](hello2.md)\n' +
                    '    * [Hello 3](hello3.md)\n' +
                    '    * [Hello 4](hello4.md)\n' +
                    '    * [Hello 5](hello5.md)\n' +
                    '* [Hello 6](hello6.md)\n'
            })
            .then(function(_book) {
                book = _book;
                return book.summary.load();
            });
        });

        it('should only return a next for the readme', function() {
            var article = book.summary.getArticle('README.md');

            var prev = article.prev();
            var next = article.next();

            should(prev).equal(null);
            should(next).be.ok();

            next.path.should.equal('hello.md');
        });

        it('should return next/prev for a first level page', function() {
            var article = book.summary.getArticle('hello.md');

            var prev = article.prev();
            var next = article.next();

            should(prev).be.ok();
            should(next).be.ok();

            prev.path.should.equal('README.md');
            next.path.should.equal('hello2.md');
        });

        it('should return next/prev for a joint -> child', function() {
            var article = book.summary.getArticle('hello2.md');

            var prev = article.prev();
            var next = article.next();

            should(prev).be.ok();
            should(next).be.ok();

            prev.path.should.equal('hello.md');
            next.path.should.equal('hello3.md');
        });

        it('should return next/prev for a joint <- child', function() {
            var article = book.summary.getArticle('hello3.md');

            var prev = article.prev();
            var next = article.next();

            should(prev).be.ok();
            should(next).be.ok();

            prev.path.should.equal('hello2.md');
            next.path.should.equal('hello4.md');
        });

        it('should return next/prev for a children', function() {
            var article = book.summary.getArticle('hello4.md');

            var prev = article.prev();
            var next = article.next();

            should(prev).be.ok();
            should(next).be.ok();

            prev.path.should.equal('hello3.md');
            next.path.should.equal('hello5.md');
        });

        it('should return next/prev for a joint -> parent', function() {
            var article = book.summary.getArticle('hello5.md');

            var prev = article.prev();
            var next = article.next();

            should(prev).be.ok();
            should(next).be.ok();

            prev.path.should.equal('hello4.md');
            next.path.should.equal('hello6.md');
        });

        it('should return prev for last', function() {
            var article = book.summary.getArticle('hello6.md');

            var prev = article.prev();
            var next = article.next();

            should(prev).be.ok();
            should(next).be.not.ok();

            prev.path.should.equal('hello5.md');
        });
    });
});

