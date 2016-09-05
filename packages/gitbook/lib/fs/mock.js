var path = require('path');
var is = require('is');
var Buffer = require('buffer').Buffer;
var Immutable = require('immutable');

var FS = require('../models/fs');
var error = require('../utils/error');

/**
    Create a fake filesystem for unit testing GitBook.

    @param {Map<String:String|Map>}
*/
function createMockFS(files) {
    files = Immutable.fromJS(files);
    var mtime = new Date();

    function getFile(filePath) {
        var parts = path.normalize(filePath).split(path.sep);
        return parts.reduce(function(list, part, i) {
            if (!list) return null;

            var file;

            if (!part || part === '.') file = list;
            else file = list.get(part);

            if (!file) return null;

            if (is.string(file)) {
                if (i === (parts.length - 1)) return file;
                else return null;
            }

            return file;
        }, files);
    }

    function fsExists(filePath) {
        return Boolean(getFile(filePath) !== null);
    }

    function fsReadFile(filePath) {
        var file = getFile(filePath);
        if (!is.string(file)) {
            throw error.FileNotFoundError({
                filename: filePath
            });
        }

        return new Buffer(file, 'utf8');
    }

    function fsStatFile(filePath) {
        var file = getFile(filePath);
        if (!file) {
            throw error.FileNotFoundError({
                filename: filePath
            });
        }

        return {
            mtime: mtime
        };
    }

    function fsReadDir(filePath) {
        var dir = getFile(filePath);
        if (!dir || is.string(dir)) {
            throw error.FileNotFoundError({
                filename: filePath
            });
        }

        return dir
            .map(function(content, name) {
                if (!is.string(content)) {
                    name = name + '/';
                }

                return name;
            })
            .valueSeq();
    }

    return FS.create({
        root: '',
        fsExists: fsExists,
        fsReadFile: fsReadFile,
        fsStatFile: fsStatFile,
        fsReadDir: fsReadDir
    });
}

module.exports = createMockFS;
