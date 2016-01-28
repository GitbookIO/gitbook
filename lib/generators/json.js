var util = require('util');
var Generator = require('./base');

function JSONGenerator() {
    Generator.apply(this, arguments);
}
util.inherits(JSONGenerator, Generator);

// Write a page (parsable file)
Generator.prototype.writePage = function(page) {
    var json = {};


    return this.output.writeFile(page.withExtension('.json'), JSON.stringify(json, null, 4));
};




module.exports = JSONGenerator;
