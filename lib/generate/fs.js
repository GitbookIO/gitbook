var Q = require("q");
var fs = require("fs");
var fsExtra = require("fs-extra");
var Ignore = require("fstream-ignore");

var getFiles = function(path) {
    var d = Q.defer();

    // Our list of files
    var files = [];

    var ig = Ignore({
        path: path,
        ignoreFiles: ['.ignore', '.gitignore', '.bookignore']
    });

    // Add extra rules to ignore common folders
    ig.addIgnoreRules([
        '.git/'
    ], '__custom_stuff');

    // Push each file to our list
    ig.on('child', function (c) {
        files.push(
            c.path.substr(c.root.path.length + 1) + (c.props.Directory === true ? '/' : '')
        );
    });

    ig.on('end', function() {
        // Normalize paths on Windows
        if(process.platform === 'win32') {
            return d.resolve(files.map(function(file) {
                return file.replace(/\\/g, '/');
            }));
        }

        // Simply return paths otherwise
        return d.resolve(files);
    });

    ig.on('error', d.reject);

    return d.promise;
};

module.exports = {
    list: getFiles,
    readFile: Q.denodeify(fs.readFile),
    writeFile: Q.denodeify(fs.writeFile),
    mkdirp: Q.denodeify(fsExtra.mkdirp),
    copy: Q.denodeify(fsExtra.copy),
    remove: Q.denodeify(fsExtra.remove),
    symlink: Q.denodeify(fsExtra.symlink),
    exists: function(path) {
        var d = Q.defer();
        fs.exists(path, d.resolve);
        return d.promise;
    },
};
