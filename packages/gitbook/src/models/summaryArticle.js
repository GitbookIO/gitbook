const { Record, List } = require('immutable');

const location = require('../utils/location');

const DEFAULTS = {
    level:      String(),
    title:      String(),
    ref:        String(),
    articles:   List()
};

/**
 * An article represents an entry in the Summary / table of Contents.
 * @type {Class}
 */
class SummaryArticle extends Record(DEFAULTS) {
    getLevel() {
        return this.get('level');
    }

    getTitle() {
        return this.get('title');
    }

    getRef() {
        return this.get('ref');
    }

    getArticles() {
        return this.get('articles');
    }

    /**
     * Return how deep the article is.
     * The README has a depth of 1
     *
     * @return {Number}
     */
    getDepth() {
        return (this.getLevel().split('.').length - 1);
    }

    /**
     * Get path (without anchor) to the pointing file.
     * It also normalizes the file path.
     *
     * @return {String}
     */
    getPath() {
        if (this.isExternal()) {
            return undefined;
        }

        const ref = this.getRef();
        if (!ref) {
            return undefined;
        }

        const parts = ref.split('#');

        const pathname = (parts.length > 1 ? parts.slice(0, -1).join('#') : ref);

        // Normalize path to remove ('./', '/...', etc)
        return location.flatten(pathname);
    }

    /**
     * Return url if article is external.
     * @return {String}
     */
    getUrl() {
        return this.isExternal() ? this.getRef() : undefined;
    }

    /**
     * Get anchor for this article (or undefined).
     * @return {String}
     */
    getAnchor() {
        const ref = this.getRef();
        const parts = ref.split('#');

        const anchor = (parts.length > 1 ? '#' + parts[parts.length - 1] : undefined);
        return anchor;
    }

    /**
     * Create a new level for a new child article.
     * @return {String}
     */
    createChildLevel() {
        const level       = this.getLevel();
        const subArticles = this.getArticles();
        const childLevel  = level + '.' + (subArticles.size + 1);

        return childLevel;
    }

    /**
     * Is article pointing to a page of an absolute url.
     * @return {Boolean}
     */
    isPage() {
        return !this.isExternal() && this.getRef();
    }

    /**
     * Check if this article is a file (exatcly)
     *
     * @param {File} file
     * @return {Boolean}
     */
    isFile(file) {
        return (
            file.path === this.getPath()
            && this.getAnchor() === undefined
        );
    }

    /**
     * Check if this article is the introduction of the book
     *
     * @param {Book|Readme} book
     * @return {Boolean}
     */
    isReadme(book) {
        const readme = book.getFile ? book : book.getReadme();
        const file = readme.getFile();

        return this.isFile(file);
    }

    /**
     * Is article pointing to aan absolute url
     *
     * @return {Boolean}
     */
    isExternal() {
        return location.isExternal(this.getRef());
    }

    /**
     * Create a SummaryArticle
     *
     * @param {Object} def
     * @return {SummaryArticle}
     */
    static create(def, level) {
        const articles = (def.articles || []).map((article, i) => {
            if (article instanceof SummaryArticle) {
                return article;
            }
            return SummaryArticle.create(article, [level, i + 1].join('.'));
        });

        return new SummaryArticle({
            level,
            title: def.title,
            ref: def.ref || def.path || '',
            articles: List(articles)
        });
    }

    /**
     * Find an article from a base one
     *
     * @param {Article|Part} base
     * @param {Function(article)} iter
     * @return {Article}
     */
    static findArticle(base, iter) {
        const articles = base.getArticles();

        return articles.reduce((result, article) => {
            if (result) return result;

            if (iter(article)) {
                return article;
            }

            return SummaryArticle.findArticle(article, iter);
        }, null);
    }
}

module.exports = SummaryArticle;
