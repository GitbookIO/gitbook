var path = require('path');
var Immutable = require('immutable');
var stream = require('stream');

var File = require('./file');
var Promise = require('../utils/promise');
var error = require('../utils/error');
var PathUtil = require('../utils/path');

var FS = Immutable.Record({
    root:           String(),

    fsExists:         Function(),
    fsReadFile:       Function(),
    fsStatFile:       Function(),
    fsReadDir:        Function(),

    fsLoadObject:     null,
    fsReadAsStream:   null
});

/**
    Return path to the root

    @return {String}
*/
FS.prototype.getRoot = function() {
    return this.get('root');
};

/**
    Verify that a file is in the fs scope

    @param {String} filename
    @return {Boolean}
*/
FS.prototype.isInScope = function(filename) {
    var rootPath = this.getRoot();
    filename = path.join(rootPath, filename);

    return PathUtil.isInRoot(rootPath, filename);
};

/**
    Resolve a file in this FS

    @param {String}
    @return {String}
*/
FS.prototype.resolve = function() {
    var rootPath = this.getRoot();
    var args = Array.prototype.slice.call(arguments);
    var filename = path.join.apply(path, [rootPath].concat(args));
    filename = path.normalize(filename);

    if (!this.isInScope(filename)) {
        throw error.FileOutOfScopeError({
            filename: filename,
            root: this.root
        });
    }

    return filename;
};

/**
    Check if a file exists, run a Promise(true) if that's the case, Promise(false) otherwise

    @param {String} filename
    @return {Promise<Boolean>}
*/
FS.prototype.exists = function(filename) {
    var that = this;

    return Promise()
    .then(function() {
        filename = that.resolve(filename);
        var exists = that.get('fsExists');

        return exists(filename);
    });
};

/**
    Read a file and returns a promise with the content as a buffer

    @param {String} filename
    @return {Promise<Buffer>}
*/
FS.prototype.read = function(filename) {
    var that = this;

    return Promise()
    .then(function() {
        filename = that.resolve(filename);
        var read = that.get('fsReadFile');

        return read(filename);
    });
};

/**
    Read a file as a string (utf-8)

    @param {String} filename
    @return {Promise<String>}
*/
FS.prototype.readAsString = function(filename, encoding) {
    encoding = encoding || 'utf8';

    return this.read(filename)
    .then(function(buf) {
        return buf.toString(encoding);
    });
};

/**
    Read file as a stream

    @param {String} filename
    @return {Promise<Stream>}
*/
FS.prototype.readAsStream = function(filename) {
    var that = this;
    var filepath = that.resolve(filename);
    var fsReadAsStream = this.get('fsReadAsStream');

    if (fsReadAsStream) {
        return Promise(fsReadAsStream(filepath));
    }

    return this.read(filename)
    .then(function(buf) {
        var bufferStream = new stream.PassThrough();
        bufferStream.end(buf);

        return bufferStream;
    });
};

/**
    Read stat infos about a file

    @param {String} filename
    @return {Promise<File>}
*/
FS.prototype.statFile = function(filename) {
    var that = this;

    return Promise()
    .then(function() {
        var filepath = that.resolve(filename);
        var stat = that.get('fsStatFile');

        return stat(filepath);
    })
    .then(function(stat) {
        return File.createFromStat(filename, stat);
    });
};

/**
    List files/directories in a directory.
    Directories ends with '/'

    @param {String} dirname
    @return {Promise<List<String>>}
*/
FS.prototype.readDir = function(dirname) {
    var that = this;

    return Promise()
    .then(function() {
        var dirpath = that.resolve(dirname);
        var readDir = that.get('fsReadDir');

        return readDir(dirpath);
    })
    .then(function(files) {
        return Immutable.List(files);
    });
};

/**
    List only files in a diretcory
    Directories ends with '/'

    @param {String} dirname
    @return {Promise<List<String>>}
*/
FS.prototype.listFiles = function(dirname) {
    return this.readDir(dirname)
    .then(function(files) {
        return files.filterNot(pathIsFolder);
    });
};

/**
    List all files in a directory

    @param {String} dirName
    @param {Function(dirName)} filterFn: call it for each file/directory to test if it should stop iterating
    @return {Promise<List<String>>}
*/
FS.prototype.listAllFiles = function(dirName, filterFn) {
    var that = this;
    dirName = dirName || '.';

    return this.readDir(dirName)
    .then(function(files) {
        return Promise.reduce(files, function(out, file) {
            var isDirectory = pathIsFolder(file);
            var newDirName = path.join(dirName, file);

            if (filterFn && filterFn(newDirName) === false) {
                return out;
            }

            if (!isDirectory) {
                return out.push(newDirName);
            }

            return that.listAllFiles(newDirName, filterFn)
            .then(function(inner) {
                return out.concat(inner);
            });
        }, Immutable.List());
    });
};

/**
    Find a file in a folder (case insensitive)
    Return the found filename

    @param {String} dirname
    @param {String} filename
    @return {Promise<String>}
*/
FS.prototype.findFile = function(dirname, filename) {
    return this.listFiles(dirname)
    .then(function(files) {
        return files.find(function(file) {
            return (file.toLowerCase() == filename.toLowerCase());
        });
    });
};

/**
    Load a JSON file
    By default, fs only supports JSON

    @param {String} filename
    @return {Promise<Object>}
*/
FS.prototype.loadAsObject = function(filename) {
    var that = this;
    var fsLoadObject = this.get('fsLoadObject');

    return this.exists(filename)
    .then(function(exists) {
        if (!exists) {
            var err = new Error('Module doesn\'t exist');
            err.code = 'MODULE_NOT_FOUND';

            throw err;
        }

        if (fsLoadObject) {
            return fsLoadObject(that.resolve(filename));
        } else {
            return that.readAsString(filename)
            .then(function(str) {
                return JSON.parse(str);
            });
        }
    });
};

/**
    Create a FS instance

    @param {Object} def
    @return {FS}
*/
FS.create = function create(def) {
    return new FS(def);
};

/**
    Create a new FS instance with a reduced scope

    @param {FS} fs
    @param {String} scope
    @return {FS}
*/
FS.reduceScope = function reduceScope(fs, scope) {
    return fs.set('root', path.join(fs.getRoot(), scope));
};


// .readdir return files/folder as a list of string, folder ending with '/'
function pathIsFolder(filename) {
    var lastChar = filename[filename.length - 1];
    return lastChar == '/' || lastChar == '\\';
}

module.exports = FS;