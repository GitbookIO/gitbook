var _ = require('lodash');
var should = require('should');
var path = require('path');
var fs = require('fs');

var Plugin = require('../lib/plugin');
var PLUGINS_ROOT = path.resolve(__dirname, 'plugins');

describe('Code Highlighting', function () {
    it('should correctly replace highlighting', function() {
        return books.generate('highlight', 'website', {
            prepare: function(book) {
                var plugin = new Plugin(book, "highlight");
                plugin.load("./highlight", PLUGINS_ROOT);

                book.plugins.load(plugin);
            }
        })
        .then(function(book) {
            var PAGE = fs.readFileSync(
                path.join(book.options.output, "index.html"),
                { encoding: "utf-8" }
            );

            PAGE.should.be.html({
                "code": {
                    count: 1,
                    text: 'code_test\n_code'
                }
            });
        });
    });
});

