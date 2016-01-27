var util = require('util');
var Generator = require('./base');

function JSONGenerator() {
    Generator.apply(this, arguments);
}
util.inherits(JSONGenerator, Generator);






module.exports = JSONGenerator;
