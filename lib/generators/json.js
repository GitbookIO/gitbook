var util = require('util');
var path = require('path');
var Q = require('q');
var _ = require('lodash');

var fs = require('../utils/fs');
var BaseGenerator = require('../generator');
var links = require('../utils/links');

var Generator = function() {
    BaseGenerator.apply(this, arguments);
};
util.inherits(Generator, BaseGenerator);

// Ignore some methods
Generator.prototype.transferFile = function() { };

// Convert an input file
Generator.prototype.convertFile = function(input) {
    var that = this;

    return that.book.parsePage(input)
    .then(function(page) {
        var json = {
            progress: page.progress,
            sections: page.sections
        };

        var output = links.changeExtension(page.path, '.json');
        output = path.join(that.options.output, output);

        return fs.writeFile(
            output,
            JSON.stringify(json, null, 4)
        );
    });
};

// Finish generation
Generator.prototype.finish = function() {
    return this.writeReadme();
};

// Write README.json
Generator.prototype.writeReadme = function() {
    var that = this;
    var mainLang, langs, readme;

    return Q()
    .then(function() {
        langs = that.book.langs;
        mainLang = langs.length > 0? _.first(langs).lang : null;

        readme = links.changeExtension(that.book.readmeFile, '.json');

        // Read readme from main language
        return fs.readFile(
            mainLang? path.join(that.options.output, mainLang, readme) : path.join(that.options.output, readme)
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
            path.join(that.options.output, 'README.json'),
            JSON.stringify(json, null, 4)
        );
    });
};

module.exports = Generator;
