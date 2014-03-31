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


prog
.command('build [source_dir]')
.description('Build a gitbook from a directory')
.option('-o, --output <directory>', 'Path to output directory, defaults to ./_book')
.option('-t, --title <name>', 'Name of the book to generate, defaults to repo name')
.option('-g, --github <repo_path>', 'ID of github repo like : username/repo')
.action(function(dir, options) {
    dir = dir || process.cwd();
    outputDir = options.output || path.join(dir, '_book');

    // Get repo's URL
    utils.gitURL(dir)
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
                github: options.github || repoID
            }
        );
    })
    .then(function(output) {
        console.log(output);
    }, function(err) {
        console.log(err.stack, err);
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
