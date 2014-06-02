var util = require("util");
var path = require("path");
var Q = require("q");
var _ = require("lodash");
var exec = require('child_process').exec;

var fs = require("fs");
var parse = require("../../parse");
var BaseGenerator = require("../page");
var stringUtils = require("../../utils/string");

/*
 *  This generator inherits from the single page generator
 *  and convert the page output to ebook
 */
var Generator = function() {
    BaseGenerator.apply(this, arguments);

    // Options for eBook generation
    this.options = _.defaults(this.options, {
        extension: "epub"
    });
};
util.inherits(Generator, BaseGenerator);

Generator.prototype.finish = function() {
    var that = this;

    return BaseGenerator.prototype.finish.apply(this)
    .then(function() {
        var d = Q.defer();
        var format = that.options.extension || path.extname(that.options.output);

        if (!that.options.cover && fs.existsSync(path.join(that.options.output, "cover.jpg"))) {
            that.options.cover = path.join(that.options.output, "cover.jpg");
        }

        var _options = {
            "--cover": that.options.cover,
            "--title": that.options.title,
            "--comments": that.options.description,
            "--authors": that.options.author,
            "--level1-toc": "descendant-or-self::*[contains(concat(' ', normalize-space(@class), ' '), ' book-chapter-1 ')]",
            "--level2-toc": "descendant-or-self::*[contains(concat(' ', normalize-space(@class), ' '), ' book-chapter-2 ')]",
            "--level3-toc": "descendant-or-self::*[contains(concat(' ', normalize-space(@class), ' '), ' book-chapter-3 ')]"
        };

        if (format == "pdf") {
            var pdfOptions = _.defaults(that.options.pdf || {}, {
                "fontSize": 12,
                "toc": true,
                "paperSize": "a4",
                "margin": {
                    "right": 62,
                    "left": 62,
                    "top": 36,
                    "bottom": 36
                }
            });

            _.extend(_options, {
                "--margin-left": String(pdfOptions.margin.left),
                "--margin-right": String(pdfOptions.margin.right),
                "--margin-top": String(pdfOptions.margin.top),
                "--margin-bottom": String(pdfOptions.margin.bottom),
                "--pdf-add-toc": Boolean(pdfOptions.toc),
                "--pdf-default-font-size": String(pdfOptions.fontSize),
                "--paper-size": String(pdfOptions.paperSize),
            });
        }

        var command = [
            "ebook-convert",
            path.join(that.options.output, "index.html"),
            path.join(that.options.output, "index."+that.options.extension),
            stringUtils.optionsToShellArgs(_options)
        ].join(" ");

        exec(command, function (error, stdout, stderr) {
            if (error) {
                if (error.code == 127) {
                    error.message = "Need to install ebook-convert from Calibre";
                } else {
                    error.message = error.message + " "+stdout;
                }
                return d.reject(error);
            }
            d.resolve();
        });

        return d.promise;
    });
};

module.exports = Generator;
