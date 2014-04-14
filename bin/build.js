var path = require('path');
var Q = require('q');
var _ = require('lodash');

var utils = require('./utils');

var generate = require("../lib/generate");
var parse = require("../lib/parse");
var fs = require('../lib/generate/fs');
var generators = require("../lib/generate").generators;

var makeBuildFunc = function(converter) {
    return  function(dir, options) {
        dir = dir || process.cwd();
        outputDir = options.output

        console.log('Starting build ...');
        // Get repo's URL
        return utils.gitURL(dir)
        .then(function(url) {
            // Get ID of repo
            return utils.githubID(url);
        }, function(err) {
            return null;
        })
        .then(function(repoID) {
            return converter(
                _.extend(options || {}, {
                    input: dir,
                    output: outputDir,
                    title: options.title,
                    description: options.intro,
                    github: options.github || repoID,
                    githubHost: options.githubHost,
                    generator: options.format,
                    theme: options.theme
                })
            );
        })
        .then(function(output) {
            console.log("Successfuly built !");
            return output;
        }, utils.logError);
    };   
}

module.exports = {
    folder: makeBuildFunc(generate.folder),
    file: makeBuildFunc(generate.file)
};
