var util = require('util');

var Output = require('./base');
var Git = require('../utils/git');
var pathUtil = require('../utils/path');

/*
Middleware for output to resolve git conrefs
*/

function ConrefsLoader() {
    Output.apply(this, arguments);
    this.git = new Git();
}
util.inherits(ConrefsLoader, Output);

// Resolve an include in the template engine
ConrefsLoader.prototype.onResolveTemplate = function(from, to) {

};

module.exports = ConrefsLoader;
