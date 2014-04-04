var util = require("util");
var path = require("path");
var Q = require("q");

var fs = require("../fs");
var parse = require("../../parse");
var BaseGenerator = require("../generator");


var Generator = function() {
    BaseGenerator.apply(this, arguments);
};
util.inherits(Generator, BaseGenerator);

Generator.prototype.transferFile = function(input) {
    // ignore
};

Generator.prototype.convertFile = function(content, input) {
    var that = this;
    var json = {
        progress: parse.progress(this.options.navigation, input)
    };

    return Q()
    .then(function() {
        return parse.page(content, {
            repo: that.options.githubId,
            dir: path.dirname(input) || '/'
        });
    })
    .then(function(sections) {
        json.sections = sections;
    })
    .then(function() {
        return fs.writeFile(
            path.join(that.options.output, input.replace(".md", ".json")),
            JSON.stringify(json, null, 4)
        );
    });
};

Generator.prototype.finish = function() {
    // ignore
};

module.exports = Generator;