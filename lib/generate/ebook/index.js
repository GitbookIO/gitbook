var util = require("util");
var path = require("path");
var Q = require("q");
var _ = require("lodash");
var exec = require('child_process').exec;

var fs = require("fs");
var parse = require("../../parse");
var BaseGenerator = require("../page");

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

    if (!this.options.cover && fs.existsSync(path.join(this.options.input, "cover.png"))) {
        this.options.cover = path.join(this.options.input, "cover.png")
    }
};
util.inherits(Generator, BaseGenerator);

Generator.prototype.finish = function() {
    var that = this;

    return BaseGenerator.prototype.finish.apply(this)
    .then(function() {
        var d = Q.defer();

        var _options = {
            "--cover": that.options.cover
        };

        var command = [
            "ebook-convert",
            path.join(that.options.output, "index.html"),
            path.join(that.options.output, "index."+that.options.extension),
            _.chain(_options)
            .map(function(value, key) {
                if (value == null) return null;
                return key+"="+value;
            })
            .compact()
            .value()
            .join(" ")
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
