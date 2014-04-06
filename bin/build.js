var path = require('path');
var Q = require('q');
var _ = require('lodash');

var utils = require('./utils');

var generate = require("../lib/generate");
var parse = require("../lib/parse");
var generators = require("../lib/generate").generators;

var buildFunc = function(dir, options) {
    dir = dir || process.cwd();
    outputDir = options.output || path.join(dir, '_book');

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
        var githubID = options.github || repoID;

        if(!githubID) {
            throw new Error('Needs a githubID (username/repo). Either set repo origin to a github repo or use the -g flag');
        }

        var parts = githubID.split('/', 2);
        var user = parts[0], repo = parts[1];

        var title = options.title || utils.titleCase(repo);

        return generate.folder(
            {
                input: dir,
                output: outputDir,
                title: title,
                description: options.intro,
                github: githubID,
                generator: options.format,
                theme: options.theme
            }
        );
    })
    .then(function(output) {
        console.log("Successfuly built !");
    }, utils.logError)
    .then(_.constant(outputDir));
};

module.exports = buildFunc;