var nunjucks = require('nunjucks');

function TemplatingEngine(book) {
    this.book = book;
    this.log = book.log;


    this.nunjucks = new nunjucks.Environment(
        this.loader,
        {
            // Escaping is done after by the asciidoc/markdown parser
            autoescape: false,

            // Syntax
            tags: {
                blockStart: '{%',
                blockEnd: '%}',
                variableStart: '{{',
                variableEnd: '}}',
                commentStart: '{###',
                commentEnd: '###}'
            }
        }
    );
}


module.exports = TemplatingEngine;
