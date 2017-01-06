const indexArticleLevels = require('./indexArticleLevels');

/**
    Index levels in a part

    @param {Part}
    @param {Number} index
    @return {Part}
*/
function indexPartLevels(part, index) {
    const baseLevel = String(index + 1);
    let articles = part.getArticles();

    articles = articles.map((inner, i) => {
        return indexArticleLevels(inner, baseLevel + '.' + (i + 1));
    });

    return part.merge({
        level: baseLevel,
        articles
    });
}

module.exports = indexPartLevels;
