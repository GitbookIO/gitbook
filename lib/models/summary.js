var Immutable = require('immutable');

var File = require('./file');
var SummaryPart = require('./summaryPart');

var Summary = Immutable.Record({
    file:       File(),
    parts:      Immutable.List()
});

Summary.prototype.getFile = function() {
    return this.get('file');
};

Summary.prototype.getParts = function() {
    return this.get('parts');
};


/**
    Create a new summary for a list of parts

    @param {Lust|Array} parts
    @return {Summary}
*/
Summary.createFromParts = function createFromParts(file, parts) {
    parts = parts.map(function(part) {
        if (part instanceof SummaryPart) {
            return part;
        }

        return SummaryPart.create(part);
    });

    return new Summary({
        file: file,
        parts: new Immutable.List(parts)
    });
};

module.exports = Summary;
