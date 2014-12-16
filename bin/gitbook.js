#! /usr/bin/env node

var Q = require('q');
var _ = require('lodash');
var path = require('path');
var prog = require('commander');
var tinylr = require('tiny-lr-fork');

var pkg = require('../package.json');
var genbook = require("../lib/generate");
var initDir = require("../lib/generate/init");
var fs = require('../lib/generate/fs');

var utils = require('./utils');
var action = utils.action;
var build = require('./build');
var Server = require('./server');
var platform = require("./platform");

// General options
prog
.version(pkg.version);

build.command(prog.command('build [source_dir]'))
.description('Build a gitbook from a directory')
.action(action(build.folder));

build.command(prog.command('serve [source_dir]'))
.description('Build then serve a gitbook from a directory')
.option('-p, --port <port>', 'Port for server to listen on', 4000)
.option('--no-watch', 'Disable restart with file watching')
.action(action(function(dir, options) {
    var server = new Server();

    // init livereload server
    var lrOptions = {port: 35729};
    var lrServer = tinylr(lrOptions);
    var lrPath = undefined;
    lrServer.listen(lrOptions.port, function(err) {
      if (err) { return console.log(err); }
      console.log('Live reload server started on port: ' + lrOptions.port);
    });

    var generate = function() {
        if (server.isRunning()) {
            console.log("Stopping server");
        }

        return server.stop()
        .then(function() {
            return build.folder(dir, _.extend(options || {}, {
                defaultsPlugins: ["livereload"]
            }));
        })
        .then(function(_options) {
            console.log();
            console.log('Starting server ...');
            return server.start(_options.output, options.port)
            .then(function() {
                console.log('Serving book on http://localhost:'+options.port);

                if (lrPath) {
                  // trigger livereload
                  lrServer.changed({body:{files:[lrPath]}})
                }

                if (!options.watch) return;
                return utils.watch(_options.input)
                .then(function(filepath) {
                    // set livereload path
                    lrPath = filepath;
                    console.log("Restart after change in files");
                    console.log('');
                    return generate();
                })
            })
        })
        .fail(utils.logError);
    };

    console.log('Press CTRL+C to quit ...');
    console.log('')

    return generate();
}));

build.commandEbook(prog.command('install [source_dir]'))
.description('Install plugins for a book')
.action(action(function(dir, options) {
    dir = dir || process.cwd();

    console.log("Install plugins in", dir);

    return genbook.config.read({
        input: dir
    })
    .then(function(options) {
        return genbook.Plugin.install(options);
    })
    .then(function() {
        console.log("Successfully installed plugins!");
    });
}));

build.commandEbook(prog.command('pdf [source_dir]'))
.description('Build a gitbook as a PDF')
.action(action(function(dir, options) {
    return build.file(dir, _.extend(options, {
        extension: "pdf",
        format: "ebook"
    }));
}));

build.commandEbook(prog.command('epub [source_dir]'))
.description('Build a gitbook as a ePub book')
.action(action(function(dir, options) {
    return build.file(dir, _.extend(options, {
        extension: "epub",
        format: "ebook"
    }));
}));

build.commandEbook(prog.command('mobi [source_dir]'))
.description('Build a gitbook as a Mobi book')
.action(action(function(dir, options) {
    return build.file(dir, _.extend(options, {
        extension: "mobi",
        format: "ebook"
    }));
}));

prog
.command('init [source_dir]')
.description('Create files and folders based on contents of SUMMARY.md')
.action(action(function(dir) {
    dir = dir || process.cwd();
    return initDir(dir);
}));

prog
.command('publish [source_dir]')
.description('Publish content to the associated gitbook.io book')
.action(action(function(dir) {
    dir = dir || process.cwd();
    return platform.publish(dir);
}));

prog
.command('git:remote [source_dir] [book_id]')
.description('Adds a git remote to a book repository')
.action(action(function(dir, bookId) {
    dir = dir || process.cwd();
    return platform.remote(dir, bookId);
}));

// Parse and fallback to help if no args
if(_.isEmpty(prog.parse(process.argv).args) && process.argv.length === 2) {
    prog.help();
}
