var util = require('util');
var Generator = require('./base');

function JSONGenerator() {
    Generator.apply(this, arguments);
}
util.inherits(JSONGenerator, Generator);

// Write a page (parsable file)
Generator.prototype.writePage = function(page) {

    return this.output.writeFile(page.withExtension('.json'));

};




module.exports = JSONGenerator;
