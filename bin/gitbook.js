#! /usr/bin/env node

var Q = require('q');
var _ = require('lodash');
var path = require('path');
var prog = require('commander');

var pkg = require('../package.json');
var generators = require("../lib/generate").generators;
var fs = require('../lib/generate/fs');

var utils = require('./utils');
var build = require('./build');

// General options
prog
.version(pkg.version);

var buildCommand = function(command) {
    return command
    .option('-o, --output <directory>', 'Path to output directory, defaults to ./_book')
    .option('-f, --format <name>', 'Change generation format, defaults to site, availables are: '+_.keys(generators).join(", "))
    .option('-t, --title <name>', 'Name of the book to generate, defaults to repo name')
    .option('-i, --intro <intro>', 'Description of the book to generate')
    .option('-g, --github <repo_path>', 'ID of github repo like : username/repo')
    .option('--githubHost <url>', 'The url of the github host (defaults to https://github.com/')
    .option('--theme <path>', 'Path to theme directory');
};

buildCommand(prog)
.command('build [source_dir]')
.description('Build a gitbook from a directory')
.action(build.folder);

buildCommand(prog)
.command('serve [source_dir]')
.description('Build then serve a gitbook from a directory')
.option('-p, --port <port>', 'Port for server to listen on', 4000)
.action(function(dir, options) {
    build.folder(dir, options)
    .then(function(_options) {
        console.log();
        console.log('Starting server ...');
        return utils.serveDir(_options.output, options.port)
        .fail(utils.logError);
    })
    .then(function() {
        console.log('Serving book on http://localhost:'+options.port);
        console.log();
        console.log('Press CTRL+C to quit ...');
    });
});

buildCommand(prog)
.command('pdf [source_dir] [output_file]')
.description('Build a gitbook as a PDF')
.option('-pf, --paperformat <format>', 'PDF paper format (default is A4): "5in*7.5in", "10cm*20cm", "A4", "Letter"')
.action(function(dir, output, options) {
    build.files(dir, output, options, {
        extension: "pdf",
        format: "pdf",
        options: {
            paperformat: options.paperformat
        }
    });
});

buildCommand(prog)
.command('ebook [source_dir] [output_file]')
.description('Build a gitbook as a eBook')
.option('-c, --cover <path>', 'Cover image, default is cover.png if exists')
.action(function(dir, output, options) {
    var ext = output ? path.extname(output) : "epub";

    build.files(dir, output, options, {
        extension: ext,
        format: "ebook",
        options: {
            extension: ext,
            cover: options.cover
        }
    });
});

// Parse and fallback to help if no args
if(_.isEmpty(prog.parse(process.argv).args) && process.argv.length === 2) {
    prog.help();
}
