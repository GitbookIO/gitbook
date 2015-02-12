var util = require("util");
var path = require("path");
var Q = require("q");
var _ = require("lodash");
var exec = require('child_process').exec;

var fs = require("../utils/fs");
var stringUtils = require("../utils/string");
var BaseGenerator = require("./website");

var Generator = function(book, format) {
    BaseGenerator.apply(this, arguments);

    // eBook format
    this.ebookFormat = format;

    // Resources namespace
    this.namespace = "ebook";

    // Styles to use
    this.styles = _.compact(["ebook", this.ebookFormat]);

    // Convert images (svg -> png)
    this.convertImages = true;
};
util.inherits(Generator, BaseGenerator);

Generator.prototype.prepareTemplates = function() {
    this.templates["page"] = this.book.plugins.template("ebook:page") || path.resolve(this.options.theme, 'templates/ebook/page.html');
    this.templates["summary"] = this.book.plugins.template("ebook:summary") || path.resolve(this.options.theme, 'templates/ebook/summary.html');
    this.templates["glossary"] = this.book.plugins.template("ebook:glossary") || path.resolve(this.options.theme, 'templates/ebook/glossary.html');

	return Q();
};

// Generate table of contents
Generator.prototype.writeSummary = function() {
    var that = this;

    that.book.log.info.ln("write SUMMARY.html");
    return this._writeTemplate(this.templates["summary"], {}, path.join(this.options.output, "SUMMARY.html"));
};

Generator.prototype.finish = function() {
    var that = this;

    return BaseGenerator.prototype.finish.apply(this)
    .then(function() {
    	return that.writeSummary();
    })
    .then(function() {
        if (!that.ebookFormat) return Q();

        var d = Q.defer();

        if (!that.options.cover && fs.existsSync(path.join(that.options.output, "cover.jpg"))) {
            that.options.cover = path.join(that.options.output, "cover.jpg");
        }

        var _options = {
            "--cover": that.options.cover,
            "--title": that.options.title,
            "--comments": that.options.description,
            "--isbn": that.options.isbn,
            "--authors": that.options.author,
            "--publisher": "GitBook",
            "--chapter": "descendant-or-self::*[contains(concat(' ', normalize-space(@class), ' '), ' book-chapter ')]",
            "--chapter-mark": "pagebreak",
            "--page-breaks-before": "/",
            "--level1-toc": "descendant-or-self::*[contains(concat(' ', normalize-space(@class), ' '), ' book-chapter-1 ')]",
            "--level2-toc": "descendant-or-self::*[contains(concat(' ', normalize-space(@class), ' '), ' book-chapter-2 ')]",
            "--level3-toc": "descendant-or-self::*[contains(concat(' ', normalize-space(@class), ' '), ' book-chapter-3 ')]",
            "--no-chapters-in-toc": true,
            "--max-levels": "1",
            "--breadth-first": true
        };

        if (that.ebookFormat == "pdf") {
            var pdfOptions = that.options.pdf;

            _.extend(_options, {
                "--margin-left": String(pdfOptions.margin.left),
                "--margin-right": String(pdfOptions.margin.right),
                "--margin-top": String(pdfOptions.margin.top),
                "--margin-bottom": String(pdfOptions.margin.bottom),
                "--pdf-default-font-size": String(pdfOptions.fontSize),
                "--pdf-mono-font-size": String(pdfOptions.fontSize),
                "--paper-size": String(pdfOptions.paperSize),
                "--pdf-page-numbers": Boolean(pdfOptions.pageNumbers),
                "--pdf-header-template": String(pdfOptions.headerTemplate),
                "--pdf-footer-template": String(pdfOptions.footerTemplate)
            });
        }

        var command = [
            "ebook-convert",
            path.join(that.options.output, "SUMMARY.html"),
            path.join(that.options.output, "index."+that.ebookFormat),
            stringUtils.optionsToShellArgs(_options)
        ].join(" ");

        that.book.log.info("start conversion to", that.ebookFormat, "....");

        var child = exec(command, function (error, stdout, stderr) {
            if (error) {
                that.book.log.info.fail();

                if (error.code == 127) {
                    error.message = "Need to install ebook-convert from Calibre";
                } else {
                    error.message = error.message + " "+stdout;
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
