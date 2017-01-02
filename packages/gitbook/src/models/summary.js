const is = require('is');
const { List, Record } = require('immutable');

const error = require('../utils/error');
const LocationUtils = require('../utils/location');
const File = require('./file');
const SummaryPart = require('./summaryPart');
const SummaryArticle = require('./summaryArticle');

const DEFAULTS = {
    file:  new File(),
    parts: List()
};

class Summary extends Record(DEFAULTS) {
    getFile() {
        return this.get('file');
    }

    getParts() {
        return this.get('parts');
    }

    /**
     * Return a part by its index.
     * @param {Number}
     * @return {Part}
     */
    getPart(i) {
        const parts = this.getParts();
        return parts.get(i);
    }

    /**
     * Return an article using an iterator to find it.
     * if "partIter" is set, it can also return a Part.
     *
     * @param {Function} iter
     * @param {Function} partIter
     * @return {Article|Part}
     */
    getArticle(iter, partIter) {
        const parts = this.getParts();

        return parts.reduce((result, part) => {
            if (result) return result;

            if (partIter && partIter(part)) return part;
            return SummaryArticle.findArticle(part, iter);
        }, null);
    }

    /**
     * Return a part/article by its level.
     *
     * @param {String} level
     * @return {Article|Part}
     */
    getByLevel(level) {
        function iterByLevel(article) {
            return (article.getLevel() === level);
        }

        return this.getArticle(iterByLevel, iterByLevel);
    }

    /**
     * Return an article by its path.
     *
     * @param {String} filePath
     * @return {Article}
     */
    getByPath(filePath) {
        return this.getArticle((article) => {
            const articlePath = article.getPath();

            return (
                articlePath &&
                LocationUtils.areIdenticalPaths(articlePath, filePath)
            );
        });
    }

    /**
     * Return the first article.
     * @return {Article}
     */
    getFirstArticle() {
        return this.getArticle((article) => {
            return true;
        });
    }

    /**
     * Return next article of an article.
     *
     * @param {Article} current
     * @return {Article}
     */
    getNextArticle(current) {
        const level = is.string(current) ? current : current.getLevel();
        let wasPrev = false;

        return this.getArticle((article) => {
            if (wasPrev) return true;

            wasPrev = article.getLevel() == level;
            return false;
        });
    }

    /**
     * Return previous article of an article.
     *
     * @param {Article} current
     * @return {Article}
     */
    getPrevArticle(current) {
        const level = is.string(current) ? current : current.getLevel();
        let prev = undefined;

        this.getArticle((article) => {
            if (article.getLevel() == level) {
                return true;
            }

            prev = article;
            return false;
        });

        return prev;
    }

    /**
     * Return the parent article, or parent part of an article.
     *
     * @param {String|Article} current
     * @return {Article|Part|Null}
     */
    getParent(level) {
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
    }

    /**
     * Return all articles as a list.
     *
     * @return {List<Article>}
     */
    getArticlesAsList() {
        const accu = [];

        this.getArticle((article) => {
            accu.push(article);
        });

        return List(accu);
    }

    /**
     * Create a new summary for a list of parts.
     *
     * @param {List|Array} parts
     * @return {Summary}
     */
    static createFromParts(parts) {
        parts = parts.map((part, i) => {
            if (part instanceof SummaryPart) {
                return part;
            }

            return SummaryPart.create(part, i + 1);
        });

        return new Summary({
            parts: new List(parts)
        });
    }
}

/**
 * Returns parent level of a level.
 *
 * @param {String} level
 * @return {String}
 */
function getParentLevel(level) {
    const parts = level.split('.');
    return parts.slice(0, -1).join('.');
}

module.exports = Summary;
