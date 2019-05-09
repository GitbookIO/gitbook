var path = require('path');
var Immutable = require('immutable');

var Language = Immutable.Record({
    title:      String(),
    path:       String()
});

Language.prototype.getTitle = function() {
    return this.get('title');
};

Language.prototype.getPath = function() {
    return this.get('path');
};

Language.prototype.getID = function() {
    return path.basename(this.getPath());
};

module.exports = Language;
