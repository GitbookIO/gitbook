const Immutable = require('immutable');

const File = require('./file');

const Readme = Immutable.Record({
    file:           new File(),
    title:          String(),
    description:    String()
});

Readme.prototype.getFile = function() {
    return this.get('file');
};

Readme.prototype.getTitle = function() {
    return this.get('title');
};

Readme.prototype.getDescription = function() {
    return this.get('description');
};

/**
    Create a new readme

    @param {File} file
    @param {Object} def
    @return {Readme}
*/
Readme.create = function(file, def) {
    def = def || {};

    return new Readme({
        file,
        title: def.title || '',
        description: def.description || ''
    });
};

module.exports = Readme;
