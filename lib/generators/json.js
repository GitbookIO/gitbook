var util = require("util");
var path = require("path");
var Q = require("q");
var _ = require("lodash");

var fs = require("../utils/fs");
var BaseGenerator = require("../generator");


var Generator = function() {
    BaseGenerator.apply(this, arguments);
};
util.inherits(Generator, BaseGenerator);

// Ignore some methods
Generator.prototype.transferFile = function(input) { };
Generator.prototype.finish = function() { };

// Convert an input file
Generator.prototype.writeParsedFile = function(page, input) {
    var that = this;
    var json = {
        progress: [],
        sections: page.sections
    };

    var output = path.basename(input, path.extname(input))+".json";
    output = path.join(that.options.output, output);

    return fs.writeFile(
        output,
        JSON.stringify(json, null, 4)
    );
};

// Generate languages index
// Contains the first languages readme and langs infos
Generator.prototype.langsIndex = function(langs) {
    var that = this;

    if (langs.length == 0) return Q.reject("Need at least one language");

    var mainLang = _.first(langs).lang;

    return Q()
    .then(function() {
        return fs.readFile(
            path.join(that.options.output, mainLang, "README.json")
        );
    })
    .then(function(content) {
        var json = JSON.parse(content);
        _.extend(json, {
            langs: langs
        });

        return fs.writeFile(
            path.join(that.options.output, "README.json"),
            JSON.stringify(json, null, 4)
        );
    });
};

module.exports = Generator;
