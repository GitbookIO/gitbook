var Immutable = require('immutable');
var TemplateBlock = require('../models/templateBlock');

module.exports = Immutable.List([
    TemplateBlock({
        name: 'html',
        process: function(blk) {
            return blk;
        }
    }),

    TemplateBlock({
        name: 'code',
        process: function(blk) {
            return {
                html: false,
                body: blk.body
            };
        }
    }),

    TemplateBlock({
        name: 'markdown',
        process: function(blk) {
            return this.book.renderInline('markdown', blk.body)
            .then(function(out) {
                return { body: out };
            });
        }
    }),

    TemplateBlock({
        name: 'asciidoc',
        process: function(blk) {
            return this.book.renderInline('asciidoc', blk.body)
            .then(function(out) {
                return { body: out };
            });
        }
    }),

    TemplateBlock({
        name: 'markup',
        process: function(blk) {
            return this.book.renderInline(this.ctx.file.type, blk.body)
            .then(function(out) {
                return { body: out };
            });
        }
    }),
]);
