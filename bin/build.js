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
            var title = options.title;
            var githubID = options.github || repoID;

            if (!title && !githubID) {
                throw new Error('Needs either a title or a githubID (username/repo).\n'+
                                '  If using github, either set repo origin to a github repo or use the -g flag.\n'+
                                '  For title, use the -t flag.');
            } else if (!title) {
                var parts = githubID.split('/', 2);
                var user = parts[0], repo = parts[1];

                title = utils.titleCase(repo);
            }

            return converter(
                _.extend(options || {}, {
                    input: dir,
                    output: outputDir,
                    title: title,
                    description: options.intro,
                    github: githubID,
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
