var Immutable = require('immutable');

var File = require('./file');

var Readme = Immutable.Record({
    file:           File(),
    title:          String(),
    description:    String()
});

Readme.prototype.getFile = function() {
    return this.get('file');
};

/**
    Create a new readme

    @param {File} file
    @param {Object} def
    @return {Readme}
*/
Readme.create = function(file, def) {
    return new Readme({
        file: file,
        title: def.title,
        description: def.description
    });
};

module.exports = Readme;
