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
    .option('--config <config file>', 'Configuration file to use, defaults to book.js or book.json')
};


var buildEbookCommand = function(command) {
    return buildCommand(command)
    .option('-c, --cover <path>', 'Cover image, default is cover.jpg if exists');
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
                generator: options.format,
                configFile: options.config
            })
        )
        .then(function(output) {
            console.log("Successfully built!");
            return output;
        }, utils.logError)
        .fail(function() {
            process.exit(-1);
        });
    };
};

module.exports = {
    folder: makeBuildFunc(generate.folder),
    file: makeBuildFunc(generate.file),
    command: buildCommand,
    commandEbook: buildEbookCommand
};
