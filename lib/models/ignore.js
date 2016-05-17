var Immutable = require('immutable');
var IgnoreMutable = require('ignore');

/*
    Immutable version of node-ignore
*/
var Ignore = Immutable.Record({
    ignore: new IgnoreMutable()
}, 'Ignore');

Ignore.prototype.getIgnore = function() {
    return this.get('ignore');
};

/**
    Test if a file is ignored by these rules

    @param {String} filePath
    @return {Boolean}
*/
Ignore.prototype.isFileIgnored = function(filename) {
    var ignore = this.getIgnore();
    return ignore.filter([filename]).length == 0;
};

/**
    Add rules

    @param {String}
    @return {Ignore}
*/
Ignore.prototype.add = function(rule) {
    var ignore = this.getIgnore();
    var newIgnore = new IgnoreMutable();

    newIgnore.add(ignore);
    newIgnore.add(rule);

    return this.set('ignore', newIgnore);
};

module.exports = Ignore;
