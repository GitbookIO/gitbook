var Q = require("q");

var BaseGenerator = function(options) {
    this.options = options;
};

BaseGenerator.prototype.convertFile = function(input) {
    return Q.reject(new Error("Could not convert "+input));
};

BaseGenerator.prototype.transferFile = function(input) {
    console.log("tranfer file", input);
    /*return fs.copy(
        path.join(root, file),
        path.join(output, file)
    );*/
};

BaseGenerator.prototype.transferFolder = function(input) {
    console.log("tranfer folder", input);
    /*return fs.mkdirp(
        path.join(output, file)
    );*/
};

BaseGenerator.prototype.finish = function() {
    return Q.reject(new Error("Could not finish generation"));
};



module.exports = BaseGenerator;