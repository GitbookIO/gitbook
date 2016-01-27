var Article = require('./article');

function Summary() {
    if (!(this instanceof Summary)) return new Summary();
}

Summary.prototype.type = 'summary';


module.exports = Summary;
