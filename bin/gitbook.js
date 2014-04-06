#! /usr/bin/env node

var Q = require('q');
var _ = require('lodash');
var path = require('path');
var prog = require('commander');
var tmp = require('tmp');

var pkg = require('../package.json');
var generators = require("../lib/generate").generators;
var fs = require('../lib/generate/fs');

var utils = require('./utils');
var buildFunc = require('./build');

// General options
prog
.version(pkg.version)
.option('-o, --output <directory>', 'Path to output directory, defaults to ./_book')
.option('-f, --format <name>', 'Change generation format, defaults to site, availables are: '+_.keys(generators).join(", "))
.option('-t, --title <name>', 'Name of the book to generate, defaults to repo name')
.option('-i, --intro <intro>', 'Description of the book to generate')
.option('-g, --github <repo_path>', 'ID of github repo like : username/repo')
.option('-gh, --githubHost <url>', 'The url of the github host (defaults to https://github.com/')
.option('--theme <path>', 'Path to theme directory');


var buildFunc;
prog
.command('build [source_dir]')
.description('Build a gitbook from a directory')
.action();

prog
.command('serve [source_dir]')
.description('Build then serve a gitbook from a directory')
.option('-p, --port <port>', 'Port for server to listen on', 4000)
.action(function(dir, options) {
    buildFunc(dir, options)
    .then(function(outputDir) {
        console.log();
        console.log('Starting server ...');
        return utils.serveDir(outputDir, options.port)
        .fail(utils.logError);
    })
    .then(function() {
        console.log('Serving book on http://localhost:'+options.port);
        console.log();
        console.log('Press CTRL+C to quit ...');
    });
});

prog
.command('pdf [source_dir] [output_file]')
.description('Build a gitbook as a PDF')
.option('-pf, --paperformat <format>', 'PDF paper format (default is A4): "5in*7.5in", "10cm*20cm", "A4", "Letter"')
.action(function(dir, outputFile, options) {
    outputFile = outputFile || path.resolve(dir, "book.pdf");

    Q.nfcall(tmp.dir)
    .then(function(tmpDir) {
        return buildFunc(
            dir,
            _.extend(options, {
                output: tmpDir,
                format: "pdf"
            })
        )
        .then(function() {
            console.log("Generating PDF in", outputFile);
            return fs.copy(
                path.join(tmpDir, "index.pdf"),
                outputFile
            )
            return fs.remove(tmpDir)
            .fail(utils.logError);
        });
    })
    
});



// Parse and fallback to help if no args
if(_.isEmpty(prog.parse(process.argv).args) && process.argv.length === 2) {
    prog.help();
}
