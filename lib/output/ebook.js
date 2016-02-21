var _ = require('lodash');
var util = require('util');
var juice = require('juice');

var command = require('../utils/command');
var fs = require('../utils/fs');
var Promise = require('../utils/promise');
var WebsiteOutput = require('./website');
var assetsInliner = require('./assets-inliner');

function _EbookOutput() {
    WebsiteOutput.apply(this, arguments);
}
util.inherits(_EbookOutput, WebsiteOutput);

var EbookOutput = assetsInliner(_EbookOutput);

EbookOutput.prototype.name = 'ebook';

// Finish generation, create ebook using ebook-convert
EbookOutput.prototype.finish = function() {
    var that = this;

    return Promise()
    .then(function() {
        return EbookOutput.super_.prototype.finish.apply(that);
    })

    // Generate SUMMARY.html
    .then(function() {
        return that.render('summary', that.getContext())
        .then(function(html) {
            return that.writeFile(
                'SUMMARY.html',
                html
            );
        });
    })

    // Start ebook-convert
    .then(function() {
        return that.ebookConvertOption();
    })

    .then(function(options) {
        var cmd = [
            'ebook-convert',
            that.resolve('SUMMARY.html'),
            that.resolve('index.'+that.opts.format),
            command.optionsToShellArgs(options)
        ].join(' ');

        return command.exec(cmd)
        .fail(function(err) {
            if (err.code == 127) {
                err = new Error('Need to install ebook-convert from Calibre');
            }

            throw err;
        });
    });
};

// Generate header/footer for PDF
EbookOutput.prototype.getPDFTemplate = function(tpl) {
    var that = this;
    var context = _.extend(
        {
            // Nunjucks context mapping to ebook-convert templating
            page: {
                num: '_PAGENUM_',
                title: '_TITLE_'
            }
        },
        this.getContext()
    );

    return this.render('pdf_'+tpl, context)

    // Inline css, include css relative to the output folder
    .then(function(output) {
        return Promise.nfcall(juice.juiceResources, tpl, {
            webResources: {
                relativeTo: that.root()
            }
        });
    });
};

// Generate options for ebook-convert
EbookOutput.prototype.ebookConvertOption = function() {
    var that = this;
    var cover = this.book.config.get('cover');

    if (!cover && fs.existsSync(this.resolve('cover.jpg'))) {
        cover = this.resolve('cover.jpg');
    }

    var options = {
        '--cover': cover,
        '--title': this.book.config.get('title'),
        '--comments': this.book.config.get('description'),
        '--isbn': this.book.config.get('isbn'),
        '--authors': this.book.config.get('author'),
        '--language': this.book.config.get('language'),
        '--book-producer': 'GitBook',
        '--publisher': 'GitBook',
        '--chapter': 'descendant-or-self::*[contains(concat(\' \', normalize-space(@class), \' \'), \' book-chapter \')]',
        '--level1-toc': 'descendant-or-self::*[contains(concat(\' \', normalize-space(@class), \' \'), \' book-chapter-1 \')]',
        '--level2-toc': 'descendant-or-self::*[contains(concat(\' \', normalize-space(@class), \' \'), \' book-chapter-2 \')]',
        '--level3-toc': 'descendant-or-self::*[contains(concat(\' \', normalize-space(@class), \' \'), \' book-chapter-3 \')]',
        '--no-chapters-in-toc': true,
        '--max-levels': '1',
        '--breadth-first': true
    };

    if (this.opts.format == 'epub') {
        options = _.extend(options, {
            '--dont-split-on-page-breaks': true
        });
    }

    if (this.opts.format != 'pdf') return Promise(options);

    var pdfOptions = this.book.config.get('pdf');

    options = _.extend(options, {
        '--chapter-mark': String(pdfOptions.chapterMark),
        '--page-breaks-before': String(pdfOptions.pageBreaksBefore),
        '--margin-left': String(pdfOptions.margin.left),
        '--margin-right': String(pdfOptions.margin.right),
        '--margin-top': String(pdfOptions.margin.top),
        '--margin-bottom': String(pdfOptions.margin.bottom),
        '--pdf-default-font-size': String(pdfOptions.fontSize),
        '--pdf-mono-font-size': String(pdfOptions.fontSize),
        '--paper-size': String(pdfOptions.paperSize),
        '--pdf-page-numbers': Boolean(pdfOptions.pageNumbers),
        '--pdf-header-template': that.getPDFTemplate('header'),
        '--pdf-footer-template': that.getPDFTemplate('footer'),
        '--pdf-sans-family': String(pdfOptions.fontFamily)
    });

    return this.getPDFTemplate('header')
    .then(function(tpl) {
        options['--pdf-header-template'] = tpl;

        return that.getPDFTemplate('footer');
    })
    .then(function(tpl) {
        options['--pdf-footer-template'] = tpl;

        return options;
    });
};

module.exports = EbookOutput;
