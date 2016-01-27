var util = require('util');
var BackboneFile = require('./file');

var Article = require('./article');

function Summary() {
    BackboneFile.apply(this, arguments);

    this.articles = [];
}
util.inherits(Summary, BackboneFile);

Summary.prototype.type = 'summary';


module.exports = Summary;
