var _ = require('lodash');
var util = require('util');
var url = require('url');

var location = require('../utils/location');
var error = require('../utils/error');
var BackboneFile = require('./file');


/*
An article represent an entry in the Summary.
It's defined by a title, a reference, and children articles, the reference (ref) can be a filename + anchor or an external file (optional)
*/
function TOCArticle(def, parent) {
    // Title
    this.title = def.title;

    // Parent TOCPart or TOCArticle
    this.parent = parent;

    // As string indicating the overall position
    // ex: '1.0.0'
    this.level = def.level;

    if (!def.title) {
        throw error.ParsingError(new Error('SUMMARY entries should have an non-empty title'));
    }

    var parts = url.parse(def.path);
    this.ref = def.path;

    if (!this.isExternal()) {
        this.path = parts.pathname;
        this.anchor = parts.hash;
    }

    this.articles = _.map(def.articles || [], function(article) {
        if (article instanceof TOCArticle) return article;
        return new TOCArticle(article, this);
    }, this);
}

// Iterate over all articles in this articles
TOCArticle.prototype.walk = function(iter) {
    _.each(this.articles, function(article) {
        iter(article);
        article.walk(iter);
    });
};

// Return templating context for an article
TOCArticle.prototype.getContext = function() {
    return {
        level: this.level,
        title: this.title,
        path: this.isExternal()? undefined : this.path,
        anchor: this.isExternal()? undefined : this.anchor,
        url: this.isExternal()? this.ref : undefined
    };
};

// Return true if is pointing to a file
TOCArticle.prototype.hasLocation = function() {
    return Boolean(this.path);
};

// Return true if is pointing to an external location
TOCArticle.prototype.isExternal = function() {
    return location.isExternal(this.ref);
};

// Return true if has children
TOCArticle.prototype.hasChildren = function() {
    return this.articles.length > 0;
};

// Return true if has an article as parent
TOCArticle.prototype.hasParent = function() {
    return (this.parent instanceof TOCArticle);
};

// Return a sibling (next or prev) in the parent
// Withotu taking in consideration children/parent
TOCArticle.prototype.sibling = function(direction) {
    var parentsArticles = this.parent.articles;
    var pos = _.findIndex(parentsArticles, this);

    if (parentsArticles[pos + direction]) {
        return parentsArticles[pos + direction];
    }

    return null;
};

// Return a sibling (next or prev)
// It takes parents.children in consideration
TOCArticle.prototype._sibling = function(direction) {
    // Next should go to the first children
    if (direction > 0 && this.hasChildren()) {
        return _.first(this.articles);
    }

    var parentsArticles = this.parent.articles;
    var pos = _.findIndex(parentsArticles, this);

    // First child and has parent
    if (pos == 0 && direction < 0 && this.hasParent()) {
        return this.parent;
    }

    // Last child and has parent
    if(pos == (parentsArticles.length - 1) && direction > 0 && this.hasParent()) {
        return this.parent.sibling(1);
    }

    if (parentsArticles[pos + direction]) {
        var article = parentsArticles[pos + direction];

        // If goign back, take last children from "brother"
        if (direction < 0 && article.hasChildren()) {
            article = _.last(article.articles);
        }

        return article;
    }

    return null;
};

// Return next article in the TOC
TOCArticle.prototype.next = function() {
    return this._sibling(1);
};

// Return previous article in the TOC
TOCArticle.prototype.prev = function() {
    return this._sibling(-1);
};

// Map over all articles
TOCArticle.prototype.map = function(iter) {
    return _.map(this.articles, iter);
};


/*
A part of a ToC is a composed of a tree of articles.
*/
function TOCPart(part) {
    this.articles = _.map(part.articles || part.chapters, function(article) {
        return new TOCArticle(article, this);
    }, this);
}

// Iterate over all entries of the part
TOCPart.prototype.walk = function(iter) {
    _.each(this.articles, function(article) {
        if (iter(article) === false) {
            return false;
        }

        article.walk(iter);
    });
};

// Map over all articles
TOCPart.prototype.map = function(iter) {
    return _.map(this.articles, iter);
};

/*
A summary is composed of a list of parts, each composed wit a tree of articles.
*/
function Summary() {
    BackboneFile.apply(this, arguments);

    this.parts = [];
    this._length = 0;
}
util.inherits(Summary, BackboneFile);

Summary.prototype.type = 'summary';

// Parse the summary content
Summary.prototype.parse = function(content) {
    var that = this;

    return this.parser.summary(content)

    // TODO: update GitBook's parsers to return a list of parts
    .then(function(part) {
        that.parts = [new TOCPart(part)];

        // Update count of articles
        that._length = 0;
        that.walk(function() {
            that._length += 1;
        });
    });
};

// Return templating context for the summary
Summary.prototype.getContext = function() {
    function onArticle(article) {
        var result = article.getContext();
        if (article.hasChildren()) {
            result.articles = article.map(onArticle);
        }

        return result;
    }

    return {
        summary: {
            parts: _.map(this.parts, function(part) {
                return {
                    articles: part.map(onArticle)
                };
            })
        }
    };
};

// Iterate over all entries of the summary
// iter is called with an TOCArticle
Summary.prototype.walk = function(iter) {
    _.each(this.parts, function(part) {
        part.walk(iter);
    });
};

// Find a specific article using a filter
Summary.prototype.find = function(filter) {
    var result;

    this.walk(function(article) {
        if (filter(article)) {
            result = article;
            return false;
        }
    });

    return result;
};

// Return the first TOCArticle for a specific page (or path)
Summary.prototype.getArticle = function(page) {
    if (!_.isString(page)) page = page.path;

    return this.find(function(article) {
        return article.path == page;
    });
};

// Return the first TOCArticle for a specific level
Summary.prototype.getArticleByLevel = function(lvl) {
    return this.find(function(article) {
        return article.level == lvl;
    });
};

// Return the count of articles in the summary
Summary.prototype.count = function() {
    return this._length;
};

module.exports = Summary;
