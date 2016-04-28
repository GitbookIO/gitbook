
/**
    Encode an article for next/prev

    @param {Map<String:Page>}
    @param {Article}
    @return {Object}
*/
function encodeArticle(pages, article) {
    var articlePath = article.getPath();

    return {
        path: articlePath,
        title: article.getTitle(),
        level: article.getLevel(),
        exists: (articlePath && pages.has(articlePath)),
        external: article.isExternal()
    };
}

/**
    this.navigation is a deprecated property from GitBook v2

    @param {Output}
    @return {Object}
*/
function encodeNavigation(output) {
    var book = output.getBook();
    var summary = book.getSummary();
    var articles = summary.getArticlesAsList();

    return articles
        .map(function(article, i) {
            var ref = article.getRef();
            if (ref) {
                return undefined;
            }

            var prev = articles.get(i - 1);
            var next = articles.get(i + 1);

            return [
                ref,
                {
                    index: i,
                    title: article.getTitle(),
                    introduction: (i === 0),
                    prev: prev? encodeArticle(prev) : undefined,
                    next: next? encodeArticle(next) : undefined,
                    level: article.getLevel()
                }
            ];
        })
        .toMap()
        .toJS();
}

module.exports = encodeNavigation;
