var util = require("util");
var path = require("path");
var Q = require("q");
var _ = require("lodash");

var fs = require("../utils/fs");
var BaseGenerator = require("../generator");
var links = require("../utils/links");

var Generator = function() {
    BaseGenerator.apply(this, arguments);
};
util.inherits(Generator, BaseGenerator);

// Ignore some methods
Generator.prototype.transferFile = function(input) { };
Generator.prototype.finish = function() { };

// Convert an input file
Generator.prototype.writeParsedFile = function(page) {
    var that = this;
    var json = {
        progress: page.progress,
        sections: page.sections
    };

    var output = links.changeExtension(page.path, ".json");
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
    var readme = links.changeExtension(that.book.readmeFile, ".json");

    return Q()
    .then(function() {
        // Read readme from main language
        return fs.readFile(
            path.join(that.options.output, mainLang, readme)
        );
    })
    .then(function(content) {
        // Extend it with infos about the languages
        var json = JSON.parse(content);
        _.extend(json, {
            langs: langs
        });

        // Write it as README.json
        return fs.writeFile(
            path.join(that.options.output, "README.json"),
            JSON.stringify(json, null, 4)
        );
    });
};

module.exports = Generator;
