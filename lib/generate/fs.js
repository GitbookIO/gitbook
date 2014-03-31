var Q = require("q");
var fs = require("fs");
var fsExtra = require("fs-extra");

module.exports = {
    readFile: Q.denodeify(fs.readFile),
    writeFile: Q.denodeify(fs.writeFile),
    mkdirp: Q.denodeify(fsExtra.mkdirp),
    copy: Q.denodeify(fsExtra.copy),
    remove: Q.denodeify(fsExtra.remove),
};
