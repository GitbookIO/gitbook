var Immutable = require('immutable');
var slug = require('github-slugid');

/*
    A definition represents an entry in the glossary
*/

var GlossaryEntry = Immutable.Record({
    name:               String(),
    description:        String()
});

GlossaryEntry.prototype.getName = function() {
    return this.get('name');
};

GlossaryEntry.prototype.getDescription = function() {
    return this.get('description');
};


/**
    Get identifier for this entry

    @retrun {Boolean}
*/
GlossaryEntry.prototype.getID = function() {
    return GlossaryEntry.nameToID(this.getName());
};


/**
    Normalize a glossary entry name into a unique id

    @param {String}
    @return {String}
*/
GlossaryEntry.nameToID = function nameToID(name) {
    return slug(name);
};


module.exports = GlossaryEntry;
