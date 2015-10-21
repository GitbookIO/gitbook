var path = require('path');
var fs = require('fs');

var Plugin = require('../lib/plugin');
var PLUGINS_ROOT = path.resolve(__dirname, 'plugins');

describe('Code Highlighting', function () {
    var book, PAGE;

    before(function() {
        return books.generate('highlight', 'website', {
            prepare: function(_book) {
                book = _book;

                var plugin = new Plugin(book, 'replace_highlight');
                plugin.load('./replace_highlight', PLUGINS_ROOT);

                book.plugins.load(plugin);
            }
        })
        .then(function() {
            PAGE = fs.readFileSync(
                path.join(book.options.output, 'index.html'),
                { encoding: 'utf-8' }
            );
        });
    });

    it('should correctly replace highlighting', function() {
        PAGE.should.be.html({
            'code': {
                index: 0,
                text: 'code_test 1\n_code'
            }
        });
    });

    it('should correctly replace highlighting with language', function() {
        PAGE.should.be.html({
            'code': {
                index: 1,
                text: 'lang_test 2\n_lang'
            }
        });
    });

    it('should correctly replace highlighting for inline code', function() {
        PAGE.should.be.html({
            'code': {
                index: 2,
                text: 'code_test 3_code'
            }
        });
    });

    it('should correctly replace highlighting for inline code with html tags', function() {
        PAGE.should.be.html({
            'code': {
                index: 3,
                text: 'code_<test>_code'
            }
        });
    });
});

