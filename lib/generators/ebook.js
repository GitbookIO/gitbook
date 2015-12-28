var util = require('util');
var path = require('path');
var Q = require('q');
var _ = require('lodash');
var juice = require('juice');
var exec = require('child_process').exec;

var fs = require('../utils/fs');
var stringUtils = require('../utils/string');
var BaseGenerator = require('./website');

var Generator = function(book, format) {
    BaseGenerator.apply(this, arguments);

    // eBook format
    this.ebookFormat = format;

    // Resources namespace
    this.namespace = 'ebook';

    // Styles to use
    this.styles = _.compact(['print', 'ebook', this.ebookFormat]);

    // Convert images (svg -> png)
    this.convertImages = true;
};
util.inherits(Generator, BaseGenerator);

Generator.prototype.prepareTemplates = function() {
    this.templates.page = this.book.plugins.template('ebook:page') || path.resolve(this.options.theme, 'templates/ebook/page.html');
    this.templates.summary = this.book.plugins.template('ebook:summary') || path.resolve(this.options.theme, 'templates/ebook/summary.html');
    this.templates.glossary = this.book.plugins.template('ebook:glossary') || path.resolve(this.options.theme, 'templates/ebook/glossary.html');

    return Q();
};

// Generate table of contents
Generator.prototype.writeSummary = function() {
    var that = this;

    that.book.log.info.ln('write SUMMARY.html');
    return this._writeTemplate(this.templates.summary, {}, path.join(this.options.output, 'SUMMARY.html'));
};

// Return template for footer/header with inlined css
Generator.prototype.getPDFTemplate = function(id) {
    var tpl = this.options.pdf[id+'Template'];
    var defaultTpl = path.resolve(this.options.theme, 'templates/ebook/'+id+'.html');
    var defaultCSS = path.resolve(this.options.theme, 'assets/ebook/pdf.css');

    // Default template from theme
    if (!tpl && fs.existsSync(defaultTpl)) {
        tpl = fs.readFileSync(defaultTpl, { encoding: 'utf-8' });
    }

    // Inline CSS using juice
    var stylesheets = [];

    // From theme
    if (fs.existsSync(defaultCSS)) {
        stylesheets.push(fs.readFileSync(defaultCSS, { encoding: 'utf-8' }));
    }

    // Custom PDF style
    if (this.styles.pdf) {
        stylesheets.push(fs.readFileSync(this.book.resolveOutput(this.styles.pdf), { encoding: 'utf-8' }));
    }

    tpl = juice(tpl, {
        extraCss: stylesheets.join('\n\n')
    });

    return tpl;
};

Generator.prototype.finish = function() {
    var that = this;

    return Q()
    .then(this.copyAssets)
    .then(this.copyCover)
    .then(this.writeGlossary)
    .then(this.writeSummary)
    .then(function() {
        if (!that.ebookFormat) return Q();

        if (!that.options.cover && fs.existsSync(path.join(that.options.output, 'cover.jpg'))) {
            that.options.cover = path.join(that.options.output, 'cover.jpg');
        }

        var d = Q.defer();

        var _options = {
            '--cover': that.options.cover,
            '--title': that.options.title,
            '--comments': that.options.description,
            '--isbn': that.options.isbn,
            '--authors': that.options.author,
            '--language': that.options.language,
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

        if (that.ebookFormat == 'pdf') {
            var pdfOptions = that.options.pdf;

            _.extend(_options, {
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
        } else if (that.ebookFormat == 'epub') {
            _.extend(_options, {
                '--dont-split-on-page-breaks': true
            });
        }

        var command = [
            'ebook-convert',
            path.join(that.options.output, 'SUMMARY.html'),
            path.join(that.options.output, 'index.'+that.ebookFormat),
            stringUtils.optionsToShellArgs(_options)
        ].join(' ');

        that.book.log.info('start conversion to', that.ebookFormat, '....');

        var child = exec(command, function (error, stdout) {
            if (error) {
                that.book.log.info.fail();

                if (error.code == 127) {
                    error.message = 'Need to install ebook-convert from Calibre';
                } else {
                    error.message = error.message + ' '+stdout;
                }
                return d.reject(error);
            }

            that.book.log.info.ok();
            d.resolve();
        });

        child.stdout.on('data', function (data) {
            that.book.log.debug(data);
        });

        child.stderr.on('data', function (data) {
            that.book.log.debug(data);
        });

        return d.promise;
    });
};

module.exports = Generator;
