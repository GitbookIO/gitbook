var Q = require("q");
var fs = require('graceful-fs');
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
        // Skip Git stuff
        '.git/',
        '.gitignore',

        // Skip OS X meta data
        '.DS_Store',

        // Skip stuff installed by plugins
        'node_modules',

        // Skip book outputs
        '*.pdf',
        '*.epub',
        '*.mobi',

        // Skip config files
        '.ignore',
        '.bookignore',
        'book.json',
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
    writeFile: function(filename, data, options) {
        var d = Q.defer();

        try {
            fs.writeFileSync(filename, data, options)
        } catch(err) {
            d.reject(err);
        }
        d.resolve();


        return d.promise;
    },
    mkdirp: Q.denodeify(fsExtra.mkdirp),
    copy: Q.denodeify(fsExtra.copy),
    remove: Q.denodeify(fsExtra.remove),
    symlink: Q.denodeify(fsExtra.symlink),
    exists: function(path) {
        var d = Q.defer();
        fs.exists(path, d.resolve);
        return d.promise;
    },
    readFileSync: fs.readFileSync.bind(fs)
};
