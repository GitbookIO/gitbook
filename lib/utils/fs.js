var _ = require("lodash");
var Q = require("q");
var tmp = require("tmp");
var fs = require("graceful-fs");
var fsExtra = require("fs-extra");
var Ignore = require("fstream-ignore");

var listFiles = function(path, options) {
    options = _.defaults(options || {}, {
        ignoreFiles: [],
        ignoreRules: []
    });

    var d = Q.defer();

    // Our list of files
    var files = [];

    var ig = Ignore({
        path: path,
        ignoreFiles: options.ignoreFiles
    });

    // Add extra rules to ignore common folders
    ig.addIgnoreRules(options.ignoreRules, '__custom_stuff');

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
    tmp: {
        file: function() {
            return Q.nfcall(tmp.file.bind(tmp)).get(0)
        },
        dir: function() {
            return Q.nfcall(tmp.dir.bind(tmp)).get(0)
        }
    },
    list: listFiles,
    stat: Q.denodeify(fs.stat),
    readdir: Q.denodeify(fs.readdir),
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
    existsSync: fs.existsSync.bind(fs),
    readFileSync: fs.readFileSync.bind(fs)
};
