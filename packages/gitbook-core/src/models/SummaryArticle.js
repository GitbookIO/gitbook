const url = require('url');
const path = require('path');
const { Record, List } = require('immutable');
const File = require('./File');

const OUTPUT_EXTENSION = '.html';

const DEFAULTS = {
    title:    '',
    depth:    0,
    path:     '',
    ref:      '',
    level:    '',
    articles: List()
};

class SummaryArticle extends Record(DEFAULTS) {
    constructor(article) {
        super({
            ...article,
            articles: (new List(article.articles))
                .map(art => new SummaryArticle(art))
        });
    }

    /**
     * Return url for a file in a GitBook context.
     * @param {Context} context
     * @return {String} url
     */
    toURL(context) {
        const { readme } = context.getState();
        const fileReadme = readme.file;
        const parts = url.parse(this.ref);

        if (parts.protocol) {
            return this.ref;
        }

        const file = new File(parts.pathname);
        let filePath = file.toURL(context);

        // Change extension and resolve to .html
        if (
            path.basename(filePath, path.extname(filePath)) == 'README' ||
            (fileReadme && filePath == fileReadme.path)
        ) {
            filePath = path.join(path.dirname(filePath), 'index' + OUTPUT_EXTENSION);
        } else {
            filePath = path.basename(filePath, path.extname(filePath)) + OUTPUT_EXTENSION;
        }

        return filePath + (parts.hash || '');
    }
}

module.exports = SummaryArticle;
