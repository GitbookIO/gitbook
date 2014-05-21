#! /usr/bin/env node

var Q = require('q');
var _ = require('lodash');
var path = require('path');
var prog = require('commander');
var tinylr = require('tiny-lr-fork');

var pkg = require('../package.json');
var generators = require("../lib/generate").generators;
var initDir = require("../lib/generate/init");
var fs = require('../lib/generate/fs');

var utils = require('./utils');
var build = require('./build');
var Server = require('./server');

// General options
prog
.version(pkg.version);

build.command(prog.command('build [source_dir]'))
.description('Build a gitbook from a directory')
.action(build.folder);

build.command(prog.command('serve [source_dir]'))
.description('Build then serve a gitbook from a directory')
.option('-p, --port <port>', 'Port for server to listen on', 4000)
.option('--no-watch', 'Disable restart with file watching')
.option('--no-cache', 'Disable cache manifest generation')
.action(function(dir, options) {
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
        if (server.isRunning()) console.log("Stopping server");

        server.stop()
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
    generate();
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
