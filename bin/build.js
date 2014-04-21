var path = require('path');
var Q = require('q');
var _ = require('lodash');
var fs = require('fs');

var utils = require('./utils');
var generate = require("../lib/generate");
var parse = require("../lib/parse");
var generators = require("../lib/generate").generators;

var buildCommand = function(command) {
    return command
    .option('-o, --output <directory>', 'Path to output directory, defaults to ./_book')
    .option('-f, --format <name>', 'Change generation format, defaults to site, availables are: '+_.keys(generators).join(", "))
    .option('-t, --title <name>', 'Name of the book to generate, default is extracted from readme')
    .option('-i, --intro <intro>', 'Description of the book to generate, default is extracted from readme')
    .option('--plugins <plugins>', 'List of plugins to use separated by ":"')
    .option('--pluginsConfig <json file>', 'JSON File containing plugins configuration')
    .option('-g, --github <repo_path>', 'ID of github repo like : username/repo')
    .option('--githubHost <url>', 'The url of the github host (defaults to https://github.com/');
};


var makeBuildFunc = function(converter) {
    return  function(dir, options) {
        dir = dir || process.cwd();
        outputDir = options.output;

        // Read plugins config
        var pluginsConfig = {};
        if (options.pluginsConfig) {
            pluginsConfig = JSON.parse(fs.readFileSync(options.pluginsConfig))
        }


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
                    plugins: options.plugins,
                    pluginsConfig: pluginsConfig
                })
            );
        })
        .then(function(output) {
            console.log("Successfuly built !");
            return output;
        }, utils.logError);
    };   
};

module.exports = {
    folder: makeBuildFunc(generate.folder),
    file: makeBuildFunc(generate.file),
    command: buildCommand
};
