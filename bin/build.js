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
    .option('--plugins <plugins>', 'List of plugins to use separated by ","')
    .option('--config <config file>', 'Configuration file to use, defualt to book.json')
    .option('-g, --github <repo_path>', 'ID of github repo like : username/repo')
    .option('--githubHost <url>', 'The url of the github host (defaults to https://github.com/');
};


var makeBuildFunc = function(converter) {
    return  function(dir, options) {
        dir = dir || process.cwd();
        outputDir = options.output;

        console.log('Starting build ...');
        return converter(
            _.extend({}, options || {}, {
                input: dir,
                output: outputDir,
                title: options.title,
                description: options.intro,
                github: options.github,
                githubHost: options.githubHost,
                generator: options.format,
                plugins: options.plugins,
                configFile: options.config
            })
        )
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
