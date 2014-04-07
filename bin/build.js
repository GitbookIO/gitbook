var path = require('path');
var Q = require('q');
var _ = require('lodash');
var tmp = require('tmp');

var utils = require('./utils');

var generate = require("../lib/generate");
var parse = require("../lib/parse");
var fs = require('../lib/generate/fs');
var generators = require("../lib/generate").generators;

var buildFunc = function(dir, options) {
    dir = dir || process.cwd();
    outputDir = options.output || path.join(dir, '_book');

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
        var title = options.title;

        if (!title) {
            var githubID = options.github || repoID;

            if(!githubID) {
                throw new Error('Needs a githubID (username/repo). Either set repo origin to a github repo or use the -g flag');
            }

            var parts = githubID.split('/', 2);
            var user = parts[0], repo = parts[1];

            title = options.title || utils.titleCase(repo);
        }

        return generate.folder(
            _.extend(options.options || {}, {
                input: dir,
                output: outputDir,
                title: title,
                description: options.intro,
                github: githubID,
                generator: options.format,
                theme: options.theme
            })
        );
    })
    .then(function(output) {
        console.log("Successfuly built !");
        return output;
    }, utils.logError);
};

var buildFiles = function(dir, outputFile, options, masterOptions) {
    var ext = masterOptions.extension;

    outputFile = outputFile || path.resolve(dir, "book."+ext);

    Q.nfcall(tmp.dir)
    .then(function(tmpDir) {
        return buildFunc(
            dir,
            _.extend(options, {
                output: tmpDir,
                format: masterOptions.format,
                options: masterOptions.options
            })
        )
        .then(function(_options) {
            var copyPDF = function(lang) {
                var _outputFile = outputFile;
                var _tmpDir = tmpDir;

                if (lang) {
                    _outputFile = _outputFile.slice(0, -path.extname(_outputFile).length)+"_"+lang+path.extname(_outputFile);
                    _tmpDir = path.join(_tmpDir, lang);
                }

                console.log("Generating in", _outputFile);
                return fs.copy(
                    path.join(_tmpDir, "index."+ext),
                    _outputFile
                );
            };

            // Multi-langs book
            return Q()
            .then(function() {
                if (_options.langsSummary) {
                    console.log("Generating for all the languages");
                    return Q.all(
                        _.map(_options.langsSummary.list, function(lang) {
                            return copyPDF(lang.lang);
                        })
                    );
                } else {
                    return copyPDF();
                }
            })
            .then(function() {
                return fs.remove(tmpDir);
            })
            .fail(utils.logError);
        });
    })
};

module.exports = {
    folder: buildFunc,
    files: buildFiles
};
