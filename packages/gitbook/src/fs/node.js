const path = require('path');
const Immutable = require('immutable');
const fresh = require('fresh-require');

const fs = require('../utils/fs');
const FS = require('../models/fs');

function fsReadDir(folder) {
    return fs.readdir(folder)
    .then((files) => {
        files = Immutable.List(files);

        return files
            .map((file) => {
                if (file == '.' || file == '..') return;

                const stat = fs.statSync(path.join(folder, file));
                if (stat.isDirectory()) file = file + path.sep;
                return file;
            })
            .filter((file) => {
                return Boolean(file);
            });
    });
}

function fsLoadObject(filename) {
    return fresh(filename, require);
}

module.exports = function createNodeFS(root) {
    return FS.create({
        root,

        fsExists: fs.exists,
        fsReadFile: fs.readFile,
        fsStatFile: fs.stat,
        fsReadDir,
        fsLoadObject,
        fsReadAsStream: fs.readStream
    });
};
