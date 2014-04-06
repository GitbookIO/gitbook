var util = require("util");
var path = require("path");
var Q = require("q");
var _ = require("lodash");
var exec = require('child_process').exec;

var fs = require("../fs");
var parse = require("../../parse");
var BaseGenerator = require("../page");

/*
 *  This generator inherits from the single page generator
 *  and convert the page output to pdf using gitbook-pdf
 */
var Generator = function() {
    BaseGenerator.apply(this, arguments);

    // Options for PDF generation
    this.options = _.defaults(this.options, {
        paperformat: "A4"
    });
};
util.inherits(Generator, BaseGenerator);

Generator.prototype.finish = function() {
    var that = this;

    return BaseGenerator.prototype.finish.apply(this)
    .then(function() {
        var d = Q.defer();

        var command = [
            "gitbook-pdf",
            "generate",
            path.join(that.options.output, "index.html"),
            path.join(that.options.output, "index.pdf"),
            "--format="+that.options.paperformat
        ].join(" ");

        exec(command, function (error, stdout, stderr) {
            if (error) {
                if (error.code == 127) {
                    error.message = "Need to install gitbook-pdf using: npm install gitbook-pdf -g";
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
