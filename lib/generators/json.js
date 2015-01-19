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

// Ignore soem methods
Generator.prototype.transferFile = function(input) { };
Generator.prototype.finish = function() { };

// Convert an input file
Generator.prototype.convertFile = function(content, input) {
    var that = this;
    var json = {
        progress: parse.progress(this.options.navigation, input)
    };

    return Q()
    .then(function() {
        return parse.page(content, {
            dir: path.dirname(input) || '/'
        });
    })
    .then(function(parsed) {
        json.lexed = parsed.lexed;
        json.sections = parsed.sections;
    })
    .then(function() {
        return fs.writeFile(
            path.join(that.options.output, input.replace(".md", ".json")),
            JSON.stringify(json, null, 4)
        );
    });
};

// Generate languages index
// Contains the first languages readme and langs infos
Generator.prototype.langsIndex = function(langs) {
    var that = this;

    if (langs.list.length == 0) return Q.reject("Need at least one language");

    var mainLang = _.first(langs.list).lang;
    console.log("Main language is", mainLang);

    return Q()
    .then(function() {
        return fs.readFile(
            path.join(that.options.output, mainLang, "README.json")
        );
    })
    .then(function(content) {
        var json = JSON.parse(content);
        _.extend(json, {
            langs: langs.list
        });

        return fs.writeFile(
            path.join(that.options.output, "README.json"),
            JSON.stringify(json, null, 4)
        );
    });
};

module.exports = Generator;
