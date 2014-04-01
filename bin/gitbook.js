#! /usr/bin/env node

// Requires
var _ = require('lodash');
var path = require('path');
var prog = require('commander');

var fs = require('fs');

var pkg = require('../package.json');
var generate = require("../lib/generate");
var parse = require("../lib/parse");

var utils = require('./utils');


// General options
prog
.version(pkg.version)
.option('-d, --dir <source_directory>', 'Source directory of book, containing Markdown files');


var buildFunc;
prog
.command('build [source_dir]')
.description('Build a gitbook from a directory')
.option('-o, --output <directory>', 'Path to output directory, defaults to ./_book')
.option('-t, --title <name>', 'Name of the book to generate, defaults to repo name')
.option('-i, --intro <intro>', 'Description of the book to generate')
.option('-g, --github <repo_path>', 'ID of github repo like : username/repo')
.action(buildFunc = function(dir, options) {
    dir = dir || process.cwd();
    outputDir = options.output || path.join(dir, '_book');
    
    console.log('Starting build ...');
    // Get repo's URL
    return utils.gitURL(dir)
    .then(function(url) {
        // Get ID of repo
        return utils.githubID(url);
    })
    .then(function(repoID) {
        var parts = repoID.split('/', 2);
        var user = parts[0], repo = parts[1];

        return generate.folder(
            dir,
            outputDir,
            {
                title: options.title || utils.titleCase(repo),
                description: options.intro,
                github: options.github || repoID
            }
        );
    })
    .then(function(output) {
        console.log("Successfuly built !");
    }, function(err) {
        console.log(err.stack || err);
        throw err;
    })
    .then(_.constant(outputDir));
});

prog
.command('serve [source_dir]')
.description('Build then serve a gitbook from a directory')
.option('-p, --port <port>', 'Port for server to listen on', 4000)
.option('-o, --output <directory>', 'Path to output directory, defaults to ./_book')
.option('-t, --title <name>', 'Name of the book to generate, defaults to repo name')
.option('-g, --github <repo_path>', 'ID of github repo like : username/repo')
.action(function(dir, options) {
    buildFunc(dir, options)
    .then(function(outputDir) {
        console.log();
        console.log('Starting server ...');
        return utils.serveDir(outputDir, options.port);
    })
    .then(function() {
        console.log('Serving book on http://localhost:'+options.port);
        console.log();
        console.log('Press CTRL+C to quit ...');
    })
    .fail(function(err) {
        console.error(err);
    });
});

prog
.command('lex <page_file>')
.description('Parse a page file into sections, display JSON dump')
.action(function(page_file) {
    var parsed = parse.page(fs.readFileSync(page_file, 'utf-8'));

    console.log(JSON.stringify(parsed, null, 4));
});



// Parse and fallback to help if no args
if(_.isEmpty(prog.parse(process.argv).args) && process.argv.length === 2) {
    prog.help();
}
