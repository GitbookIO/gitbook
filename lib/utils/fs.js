var _ = require('lodash');
var Q = require('q');
var tmp = require('tmp');
var path = require('path');
var fs = require('graceful-fs');
var fsExtra = require('fs-extra');
var Ignore = require('fstream-ignore');

var fsUtils = {
    tmp: {
        file: function(opt) {
            return Q.nfcall(tmp.file.bind(tmp), opt).get(0);
        },
        dir: function() {
            return Q.nfcall(tmp.dir.bind(tmp)).get(0);
        }
    },
    list: listFiles,
    stat: Q.denodeify(fs.stat),
    readdir: Q.denodeify(fs.readdir),
    readFile: Q.denodeify(fs.readFile),
    writeFile: writeFile,
    writeStream: writeStream,
    mkdirp: Q.denodeify(fsExtra.mkdirp),
    copy: Q.denodeify(fsExtra.copy),
    remove: Q.denodeify(fsExtra.remove),
    symlink: Q.denodeify(fsExtra.symlink),
    exists: function(path) {
        var d = Q.defer();
        fs.exists(path, d.resolve);
        return d.promise;
    },
    findFile: findFile,
    existsSync: fs.existsSync.bind(fs),
    readFileSync: fs.readFileSync.bind(fs),
    clean: cleanFolder,
    getUniqueFilename: getUniqueFilename
};

// Write a file
function writeFile(filename, data, options) {
    var d = Q.defer();

    try {
        fs.writeFileSync(filename, data, options);
    } catch(err) {
        d.reject(err);
    }
    d.resolve();


    return d.promise;
}

// Write a stream to a file
function writeStream(filename, st) {
    var d = Q.defer();

    var wstream = fs.createWriteStream(filename);

    wstream.on('finish', function () {
        d.resolve();
    });
    wstream.on('error', function (err) {
        d.reject(err);
    });

    st.on('error', function(err) {
        d.reject(err);
    });

    st.pipe(wstream);

    return d.promise;
}

// Find a filename available
function getUniqueFilename(base, filename) {
    if (!filename) {
        filename = base;
        base = '/';
    }

    filename = path.resolve(base, filename);
    var ext = path.extname(filename);
    filename = path.join(path.dirname(filename), path.basename(filename, ext));

    var _filename = filename+ext;

    var i = 0;
    while (fs.existsSync(filename)) {
        _filename = filename+'_'+i+ext;
        i = i + 1;
    }

    return path.relative(base, _filename);
}


// List files in a directory
function listFiles(root, options) {
    options = _.defaults(options || {}, {
        ignoreFiles: [],
        ignoreRules: []
    });

    var d = Q.defer();

    // Our list of files
    var files = [];

    var ig = Ignore({
        path: root,
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
}

// Clean a folder without removing .git and .svn
// Creates it if non existant
function cleanFolder(root) {
    if (!fs.existsSync(root)) return fsUtils.mkdirp(root);

    return listFiles(root, {
        ignoreFiles: [],
        ignoreRules: [
            // Skip Git and SVN stuff
            '.git/',
            '.svn/'
        ]
    })
    .then(function(files) {
        var d = Q.defer();

        _.reduce(files, function(prev, file, i) {
            return prev.then(function() {
                var _file = path.join(root, file);

                d.notify({
                    i: i+1,
                    count: files.length,
                    file: _file
                });
                return fsUtils.remove(_file);
            });
        }, Q())
        .then(function() {
            d.resolve();
        }, function(err) {
            d.reject(err);
        });

        return d.promise;
    });
}

// Find a file in a folder (case incensitive)
// Return the real filename
function findFile(root, filename) {
    return Q.nfcall(fs.readdir, root)
    .then(function(files) {
        return _.find(files, function(file) {
            return (file.toLowerCase() == filename.toLowerCase());
        });
    });
}

module.exports = fsUtils;
