var BaseGenerator = require("./generator");
var util = require("util");

var Generator = function() {
    BaseGenerator.apply(this, arguments);
};
util.inherits(Generator, BaseGenerator);

Generator.prototype.convertFile = function(input) {
    console.log("convert file", input)
};

Generator.prototype.finish = function() {
    console.log("finish generation");
    // Symlink index.html to README.html
    /*.then(function() {
        return fs.symlink(
            path.join(output, 'README.html'),
            path.join(output, 'index.html')
        );
    })

    // Copy assets
    .then(function() {
        return fs.copy(
            path.join(__dirname, "../../assets/static"),
            path.join(output, "gitbook")
        );
    });*/
};

module.exports = Generator;