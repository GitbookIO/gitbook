const path = require('path');
const Immutable = require('immutable');

const Language = Immutable.Record({
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
