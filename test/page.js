var mock = require('./mock');
var Output = require('../lib/output/base');

describe('Page', function() {
    var book, output;

    before(function() {
        return mock.setupDefaultBook({
            'heading.md': '# Hello\n\n## World',
            'links.md': '[link](hello.md) [readme](README.md)',

            'codes/simple.md': '```hello world```',
            'codes/lang.md': '```js\nhello world\n```',
            'codes/lang.adoc': '```js\nhello world\n```',

            'folder/paths.md': '',

            'variables/file/mtime.md': '{{ file.mtime }}',
            'variables/file/path.md': '{{ file.path }}',
            'variables/page/title.md': '{{ page.title }}',
            'variables/page/previous.md': '{{ page.previous.title }} {{ page.previous.path }}',
            'variables/page/next.md': '{{ page.next.title }} {{ page.next.path }}'
        }, [
            {
                title: 'Test page.next',
                path: 'variables/page/next.md'
            },
            {
                title: 'Test Variables',
                path: 'variables/page/title.md'
            },
            {
                title: 'Test page.previous',
                path: 'variables/page/previous.md'
            }
        ])
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

    describe('Code Blocks', function() {
        var page;

        before(function() {
            output.template.addBlock('code', function(blk) {
                return (blk.kwargs.language || '') + blk.body + 'test';
            });
        });

        it('should apply "code" block', function() {
            page = book.addPage('codes/simple.md');
            return page.toHTML(output)
                .should.be.fulfilledWith('<p><code>hello worldtest</code></p>\n');
        });

        it('should add language as kwargs', function() {
            page = book.addPage('codes/lang.md');
            return page.toHTML(output)
                .should.be.fulfilledWith('<pre><code class="lang-js">jshello world\ntest</code></pre>\n');
        });

        it('should add language as kwargs (asciidoc)', function() {
            page = book.addPage('codes/lang.adoc');
            return page.toHTML(output)
                .should.be.fulfilledWith('<div class="listingblock">\n<div class="content">\n<pre class="highlight"><code class="language-js" data-lang="js">jshello worldtest</code></pre>\n</div>\n</div>');
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

        it('should set file.path', function() {
            var page = book.addPage('variables/file/path.md');
            return page.toHTML(output)
            .should.be.fulfilledWith('<p>variables/file/path.md</p>\n');
        });

        it('should set page.title when page is in summary', function() {
            var page = book.getPage('variables/page/title.md');
            return page.toHTML(output)
            .should.be.fulfilledWith('<p>Test Variables</p>\n');
        });

        it('should set page.previous when possible', function() {
            var page = book.getPage('variables/page/previous.md');
            return page.toHTML(output)
            .should.be.fulfilledWith('<p>Test Variables variables/page/title.md</p>\n');
        });

        it('should set page.next when possible', function() {
            var page = book.getPage('variables/page/next.md');
            return page.toHTML(output)
            .should.be.fulfilledWith('<p>Test Variables variables/page/title.md</p>\n');
        });
    });
});
