const Immutable = require('immutable');
const TemplateBlock = require('../models/templateBlock');

module.exports = Immutable.Map({
    html: TemplateBlock({
        name: 'html',
        process(blk) {
            return blk;
        }
    }),

    code: TemplateBlock({
        name: 'code',
        process(blk) {
            return {
                html: false,
                body: blk.body
            };
        }
    }),

    markdown: TemplateBlock({
        name: 'markdown',
        process(blk) {
            return this.book.renderInline('markdown', blk.body)
            .then(function(out) {
                return { body: out };
            });
        }
    }),

    asciidoc: TemplateBlock({
        name: 'asciidoc',
        process(blk) {
            return this.book.renderInline('asciidoc', blk.body)
            .then(function(out) {
                return { body: out };
            });
        }
    }),

    markup: TemplateBlock({
        name: 'markup',
        process(blk) {
            return this.book.renderInline(this.ctx.file.type, blk.body)
            .then(function(out) {
                return { body: out };
            });
        }
    })
});
