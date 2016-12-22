const is = require('is');
const Immutable = require('immutable');

const error = require('../utils/error');
const LocationUtils = require('../utils/location');
const File = require('./file');
const SummaryPart = require('./summaryPart');
const SummaryArticle = require('./summaryArticle');
const parsers = require('../parsers');

const Summary = Immutable.Record({
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
    const parts = this.getParts();
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
    const parts = this.getParts();

    return parts.reduce(function(result, part) {
        if (result) return result;

        if (partIter && partIter(part)) return part;
        return SummaryArticle.findArticle(part, iter);
    }, null);
};


/**
    Return a part/article by its level

    @param {String} level
    @return {Article|Part}
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
        const articlePath = article.getPath();

        return (
            articlePath &&
            LocationUtils.areIdenticalPaths(articlePath, filePath)
        );
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
    Return next article of an article

    @param {Article} current
    @return {Article}
*/
Summary.prototype.getNextArticle = function(current) {
    const level = is.string(current) ? current : current.getLevel();
    let wasPrev = false;

    return this.getArticle(function(article) {
        if (wasPrev) return true;

        wasPrev = article.getLevel() == level;
        return false;
    });
};

/**
    Return previous article of an article

    @param {Article} current
    @return {Article}
*/
Summary.prototype.getPrevArticle = function(current) {
    const level = is.string(current) ? current : current.getLevel();
    let prev = undefined;

    this.getArticle(function(article) {
        if (article.getLevel() == level) {
            return true;
        }

        prev = article;
        return false;
    });

    return prev;
};

/**
    Return the parent article, or parent part of an article

    @param {String|Article} current
    @return {Article|Part|Null}
*/
Summary.prototype.getParent = function(level) {
    // Coerce to level
    level = is.string(level) ? level : level.getLevel();

    // Get parent level
    const parentLevel = getParentLevel(level);
    if (!parentLevel) {
        return null;
    }

    // Get parent of the position
    const parentArticle = this.getByLevel(parentLevel);
    return parentArticle || null;
};

/**
    Render summary as text

    @param {String} parseExt Extension of the parser to use
    @return {Promise<String>}
*/
Summary.prototype.toText = function(parseExt) {
    const file = this.getFile();
    const parts = this.getParts();

    const parser = parseExt ? parsers.getByExt(parseExt) : file.getParser();

    if (!parser) {
        throw error.FileNotParsableError({
            filename: file.getPath()
        });
    }

    return parser.renderSummary({
        parts: parts.toJS()
    });
};

/**
    Return all articles as a list

    @return {List<Article>}
*/
Summary.prototype.getArticlesAsList = function() {
    const accu = [];

    this.getArticle(function(article) {
        accu.push(article);
    });

    return Immutable.List(accu);
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
        file,
        parts: new Immutable.List(parts)
    });
};

/**
    Returns parent level of a level

    @param {String} level
    @return {String}
*/
function getParentLevel(level) {
    const parts = level.split('.');
    return parts.slice(0, -1).join('.');
}

module.exports = Summary;
