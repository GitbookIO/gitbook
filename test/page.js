var mock = require('./mock');
var Output = require('../lib/output/base');

describe('Page', function() {
    var book, output;

    before(function() {
        return mock.setupDefaultBook({
            'heading.md': '# Hello\n\n## World',
            'links.md': '[link](hello.md) [readme](README.md)',
            'folder/paths.md': '',
            'variables/file/mtime.md': '{{ file.mtime }}',
            'variables/file/path.md': '{{ file.path }}'
        })
        .then(function(_book) {
            book = _book;
            output = new Output(book);

            return book.parse();
        });
    });

    describe('.resolveLocal', function() {
        it('should correctly resolve path to file', function() {
            var page = book.addPage('heading.md');

            page.resolveLocal('test.png').should.equal('test.png');
            page.resolveLocal('/test.png').should.equal('test.png');
            page.resolveLocal('test/hello.png').should.equal('test/hello.png');
            page.resolveLocal('/test/hello.png').should.equal('test/hello.png');
        });

        it('should correctly resolve path to file (2)', function() {
            var page = book.addPage('folder/paths.md');

            page.resolveLocal('test.png').should.equal('folder/test.png');
            page.resolveLocal('/test.png').should.equal('test.png');
            page.resolveLocal('test/hello.png').should.equal('folder/test/hello.png');
            page.resolveLocal('/test/hello.png').should.equal('test/hello.png');
        });
    });

    describe('.relative', function() {
        it('should correctly resolve absolute path in the book', function() {
            var page = book.addPage('heading.md');
            var page2 = book.addPage('folder/paths.md');

            page.relative('/test.png').should.equal('test.png');
            page.relative('test.png').should.equal('test.png');
            page2.relative('/test.png').should.equal('../test.png');
            page2.relative('test.png').should.equal('test.png');
        });
    });

    describe('Headings', function() {
        it('should add a default ID to headings', function() {
            var page = book.addPage('heading.md');

            return page.toHTML(output)
            .then(function() {
                page.content.should.be.html({
                    'h1#hello': {
                        count: 1
                    },
                    'h2#world': {
                        count: 1
                    }
                });
            });
        });
    });

    describe('Links', function() {
        var page;

        before(function() {
            page = book.addPage('links.md');
            return page.toHTML(output);
        });

        it('should replace links to page to .html', function() {
            page.content.should.be.html({
                'a[href="index.html"]': {
                    count: 1
                }
            });
        });

        it('should not replace links to file not in SUMMARY', function() {
            page.content.should.be.html({
                'a[href="hello.md"]': {
                    count: 1
                }
            });
        });
    });


    describe('Templating Context', function() {
        it('should set file.mtime', function() {
            var page = book.addPage('variables/file/mtime.md');
            return page.toHTML(output)
            .then(function(content) {
                content.should.endWith('(CET)</p>\n');
            });
        });

        it('should set file.[path]', function() {
            var page = book.addPage('variables/file/path.md');
            return page.toHTML(output)
            .should.be.fulfilledWith('<p>variables/file/path.md</p>\n');
        });
    });
});