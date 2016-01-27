var url = require('url');
var _ = require('lodash');

/*
An article represent an entry in the Summary.
It's defined by a title, a reference, and children articles, the reference (ref) can be a filename + anchor (optional)

*/

function Article(title, ref, articles) {
    var parts = url.parse(ref);

    this.title = title;
    this.filename = parts.pathname;
    this.anchor = parts.hash;
    this.articles = _.map(articles || [], function(article) {
        if (article instanceof Article) return article;
        return new Article(article.title, article.ref, article.articles);
    })
}

// Return true if has children
Article.prototype.hasChildren = function() {
    return this.articles.length > 0;
};


module.exports = Article;
