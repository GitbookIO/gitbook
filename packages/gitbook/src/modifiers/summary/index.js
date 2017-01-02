module.exports = {
    toDocument:       require('./toDocument'),
    toText:           require('./toText'),
    // Articles
    insertArticle:    require('./insertArticle'),
    moveArticle:      require('./moveArticle'),
    moveArticleAfter: require('./moveArticleAfter'),
    removeArticle:    require('./removeArticle'),
    unshiftArticle:   require('./unshiftArticle'),
    editArticleTitle: require('./editArticleTitle'),
    editArticleRef:   require('./editArticleRef'),
    // Parts
    insertPart:       require('./insertPart'),
    removePart:       require('./removePart'),
    editPartTitle:    require('./editPartTitle')
};
