var _ = require('lodash');
var util = require('util');
var BackboneFile = require('./file');

/*
A glossary entry is represented by a name and a short description
An unique id for the entry is generated using its name
*/
function GlossaryEntry(name, description) {
    if (!(this instanceof Glossary)) return new Glossary();

    this.name = name;
    this.description = description;

    Object.defineProperty(this, 'id', {
        get: _.bind(this.getId, this)
    });
}

// Normalizes a glossary entry's name to create an ID
GlossaryEntry.prototype.getId = function() {
    return this.name.toLowerCase()
        .replace(/[\/\\\?\%\*\:\;\|\"\'\\<\\>\#\$\(\)\!\.\@]/g, '')
        .replace(/ /g, '_')
        .trim();
};


function Glossary() {
    BackboneFile.apply(this, arguments);

    this.entries = [];
}
util.inherits(Glossary, BackboneFile);

Glossary.prototype.type = 'glossary';

// Parse the readme content
Glossary.prototype.parse = function(content) {
    var that = this;

    return this.parser.glossary(content)
    .then(function(entries) {
        that.entries = _.map(entries, function(entry) {
            return new GlossaryEntry(entry.name, entry.description);
        });
    });
};

// Return an entry by its id
Glossary.prototype.get = function(id) {
    return _.find(this.entries, {
        id: id
    });
};

module.exports = Glossary;
