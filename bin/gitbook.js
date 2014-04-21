#! /usr/bin/env node

var Q = require('q');
var _ = require('lodash');
var path = require('path');
var prog = require('commander');

var pkg = require('../package.json');
var generators = require("../lib/generate").generators;
var initDir = require("../lib/generate/init");
var fs = require('../lib/generate/fs');

var utils = require('./utils');
var build = require('./build');

// General options
prog
.version(pkg.version);

build.command(prog.command('build [source_dir]'))
.description('Build a gitbook from a directory')
.action(build.folder);

build.command(prog.command('serve [source_dir]'))
.description('Build then serve a gitbook from a directory')
.option('-p, --port <port>', 'Port for server to listen on', 4000)
.action(function(dir, options) {
    build.folder(dir, options || {})
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

build.command(prog.command('pdf [source_dir]'))
.description('Build a gitbook as a PDF')
.option('-pf, --paperformat <format>', 'PDF paper format (default is A4): "5in*7.5in", "10cm*20cm", "A4", "Letter"')
.action(function(dir, options) {
    build.file(dir, _.extend(options, {
        extension: "pdf",
        format: "pdf"
    }));
});

build.command(prog.command('ebook [source_dir]'))
.description('Build a gitbook as a eBook')
.option('-c, --cover <path>', 'Cover image, default is cover.png if exists')
.action(function(dir, options) {
    var ext = options.output ? path.extname(options.output) : "epub";

    build.file(dir, _.extend(options, {
        extension: ext,
        format: "ebook"
    }));
});

prog
.command('init [source_dir]')
.description('Create files and folders based on contents of SUMMARY.md')
.action(function(dir) {
    dir = dir || process.cwd();
    return initDir(dir);
});

// Parse and fallback to help if no args
if(_.isEmpty(prog.parse(process.argv).args) && process.argv.length === 2) {
    prog.help();
}
