const PathUtils = require('../../utils/path');

/**
 * Update refs of all articles matching the given path, to the new path.
 * Refs are updated as if you were moving a file or a directory.
 * @param {Summary} summary
 * @param {String} path Can be a file path, or directory path
 * @param {String} newPath
 * @return {Summary}
 */
function movePath(summary, path, newPath) {
    // Normalize dirs path by
    // stripping trailing separators for dirs.
    path = PathUtils.stripTrailingSep(path);
    newPath = PathUtils.stripTrailingSep(newPath);

    const parts = summary.getParts()
        .map((part) => {
            const articles = moveArticlesPath(part.getArticles(), path, newPath);
            return part.merge({ articles });
        });

    return summary.merge({ parts });
}

/**
 * Same as `movePath` but for a list of articles.
 *
 * @param {List<Article>} articles
 * @param {String} path
 * @param {String} newPath
 * @return {List<Article}
 */
function moveArticlesPath(articles, path, newPath) {
    return articles
        .map(article => article.merge({
            ref: moveRef(article, path, newPath),
            articles: moveArticlesPath(article.articles, path, newPath)
        }));
}

/**
 * @param {Article} article
 * @param {String} path File path or dir path
 * @param {String} newPath
 * @return {String} The updated ref for this article (unchanged if not matching `path`).
 */
function moveRef(article, path, newPath) {
    const articlePath = article.getPath();
    if (!articlePath || !PathUtils.isInside(articlePath, path)) {
        // Nothing to update
        return article.getRef();
    }

    // else move it
    const anchor = article.getAnchor() || '' ;
    return newPath + articlePath.substring(path.length) + anchor;
}

module.exports = movePath;
