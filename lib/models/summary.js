var Immutable = require('immutable');

var error = require('../utils/error');
var File = require('./file');
var SummaryPart = require('./summaryPart');
var SummaryArticle = require('./summaryArticle');
var parsers = require('../parsers');

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
    Return a part by its index

    @param {Number}
    @return {Part}
*/
Summary.prototype.getPart = function(i) {
    var parts = this.getParts();
    return parts.get(i);
};

/**
    Return an article using an iterator to find it.
    if "partIter" is set, it can also return a Part.

    @param {Function} iter
    @param {Function} partIter
    @return {Article|Part}
*/
Summary.prototype.getArticle = function(iter, partIter) {
    var parts = this.getParts();

    return parts.reduce(function(result, part) {
        if (result) return result;

        if (partIter && partIter(part)) return part;
        return SummaryArticle.findArticle(part, iter);
    }, null);
};


/**
    Return a part/article by its level

    @param {String} level
    @return {Article}
*/
Summary.prototype.getByLevel = function(level) {
    function iterByLevel(article) {
        return (article.getLevel() === level);
    }

    return this.getArticle(iterByLevel, iterByLevel);
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
    Return the first article

    @return {Article}
*/
Summary.prototype.getFirstArticle = function() {
    return this.getArticle(function(article) {
        return true;
    });
};

/**
    Render summary as text

    @return {Promise<String>}
*/
Summary.prototype.toText = function(parser) {
    var file = this.getFile();
    var parts = this.getParts();

    parser = parser? parsers.getByExt(parser) : file.getParser();

    if (!parser) {
        throw error.FileNotParsableError({
            filename: file.getPath()
        });
    }

    return parser.summary.toText({
        parts: parts.toJS()
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

        return SummaryPart.create(part, i + 1);
    });

    return new Summary({
        file: file,
        parts: new Immutable.List(parts)
    });
};

module.exports = Summary;
