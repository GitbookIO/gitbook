const PathUtils = require('../../utils/path');

/**
 * Delete all articles pointing to a file under the given path. If some
 * of their children do not share that same path, the articles are
 * simply unlinked.
 *
 * @param {Summary} summary
 * @param {String} path Can be a file path or directory path
 * @return {Summary}
 */
function deleteByPath(summary, path) {
    const parts = summary.getParts()
        .map((part) => {
            const articles = deleteArticlesByPath(part.getArticles(), path);
            return part.merge({ articles });
        });

    return summary.merge({ parts });
}

/**
 * Same as `deleteByPath` but for a list of articles.
 *
 * @param {List<Article>} articles
 * @param {String} path
 * @return {List<Article}
 */
function deleteArticlesByPath(articles, path) {
    return articles
        // Delete leaf articles first
        .map(article => article.merge({
            articles: deleteArticlesByPath(article.articles, path)
        }))
        // Then delete top level articles if they don't have any descendant left.
        .filterNot(article =>
            article.getArticles().isEmpty()
            && PathUtils.isInside(article.getPath() || '', path)
        )
        // Unlink those left
        .map(article => PathUtils.isInside(article.getPath() || '', path)
            ? article.merge({ ref: '' })
            : article
        );
}

module.exports = deleteByPath;
