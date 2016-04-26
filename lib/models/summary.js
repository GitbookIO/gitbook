var Immutable = require('immutable');

var File = require('./file');
var SummaryPart = require('./summaryPart');
var SummaryArticle = require('./summaryArticle');

var Summary = Immutable.Record({
    file:       File(),
    parts:      Immutable.List()
}, 'Summary');

Summary.prototype.getFile = function() {
    return this.get('file');
};

Summary.prototype.getParts = function() {
    return this.get('parts');
};

/**
    Return an article using an iterator to find it

    @param {Function} iter
    @return {Article}
*/
Summary.prototype.getArticle = function(iter) {
    var parts = this.getParts();

    return parts.reduce(function(result, part) {
        if (result) return result;

        return SummaryArticle.findArticle(part, iter);
    }, null);
};


/**
    Return a part/article by its level

    @param {String} level
    @return {Article}
*/
Summary.prototype.getByLevel = function(level) {
    return this.getArticle(function(article) {
        return (article.getLevel() === level);
    });
};

/**
    Return an article by its path

    @param {String} filePath
    @return {Article}
*/
Summary.prototype.getByPath = function(filePath) {
    return this.getArticle(function(article) {
        return (article.getPath() === filePath);
    });
};

/**
    Create a new summary for a list of parts

    @param {Lust|Array} parts
    @return {Summary}
*/
Summary.createFromParts = function createFromParts(file, parts) {
    parts = parts.map(function(part, i) {
        if (part instanceof SummaryPart) {
            return part;
        }

        return SummaryPart.create(part, i);
    });

    return new Summary({
        file: file,
        parts: new Immutable.List(parts)
    });
};

module.exports = Summary;
