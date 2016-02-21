var _ = require('lodash');
var util = require('util');
var url = require('url');

var location = require('../utils/location');
var error = require('../utils/error');
var BackboneFile = require('./file');


/*
    An article represent an entry in the Summary.
    It's defined by a title, a reference, and children articles,
    the reference (ref) can be a filename + anchor or an external file (optional)
*/
function TOCArticle(def, parent) {
    // Title
    this.title = def.title;

    // Parent TOCPart or TOCArticle
    this.parent = parent;

    // As string indicating the overall position
    // ex: '1.0.0'
    this.level;

    // When README has been automatically added
    this.isAutoIntro = def.isAutoIntro;
    this.isIntroduction = def.isIntroduction;

    this.validate();

    // Path can be a relative path or an url, or nothing
    this.ref = def.path;
    if (this.ref) {
        var parts = url.parse(this.ref);

        if (!this.isExternal()) {
            this.path = parts.pathname;
            this.anchor = parts.hash;
        }
    }

    this.articles = _.map(def.articles || [], function(article) {
        if (article instanceof TOCArticle) return article;
        return new TOCArticle(article, this);
    }, this);
}

// Validate the article
TOCArticle.prototype.validate = function() {
    if (!this.title) {
        throw error.ParsingError(new Error('SUMMARY entries should have an non-empty title'));
    }
};

// Iterate over all articles in this articles
TOCArticle.prototype.walk = function(iter, base) {
    base = base || this.level;

    _.each(this.articles, function(article, i) {
        var level = levelId(base, i);

        if (iter(article, level) === false) {
            return false;
        }
        article.walk(iter, level);
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

// Return true if this article is the introduction
TOCArticle.prototype.isIntro = function() {
    return Boolean(this.isIntroduction);
};

// Return true if has children
TOCArticle.prototype.hasChildren = function() {
    return this.articles.length > 0;
};

// Return true if has an article as parent
TOCArticle.prototype.hasParent = function() {
    return !(this.parent instanceof TOCPart);
};

// Return true if has a part as parent
TOCArticle.prototype.hasParentPart = function() {
    return (this.parent instanceof TOCPart);
};

// Return first article
TOCArticle.prototype.first = function() {
    return _.first(this.articles);
};

// Return last article
TOCArticle.prototype.last = function() {
    var last = _.last(this.articles);
    if (!last) return null;

    return last.last() || last;
};

// Return a sibling (next or prev) in the parent
// Without taking in consideration children/parent
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

    var part;
    var parentsArticles = this.parent.articles;
    var pos = _.findIndex(parentsArticles, this);

    // First child and has parent
    if (pos == 0 && direction < 0) {
        if (this.hasParent()) {
            return this.parent;
        } else if (this.hasParentPart()) {
            part = this.parent.sibling(-1);
            return part? part.last() : null;
        }
    }

    // Last child and has parent
    if(pos == (parentsArticles.length - 1) && direction > 0) {
        if (this.hasParent()) {
            return this.parent.sibling(1);
        } else if (this.hasParentPart()) {
            part = this.parent.sibling(1);
            return part? part.first() : null;
        }
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
    A part of a ToC is a composed of a tree of articles and an optiona title
*/
function TOCPart(part, summary) {
    if (!(this instanceof TOCPart)) return new TOCPart(part);

    TOCArticle.apply(this, arguments);

    this.summary = summary;
}
util.inherits(TOCPart, TOCArticle);

// Validate the part
TOCPart.prototype.validate = function() { };

// Return a sibling (next or prev) of this part
TOCPart.prototype.sibling = function(direction) {
    var parts = this.summary.parts;
    var pos = _.findIndex(parts, this);

    if (parts[pos + direction]) {
        return parts[pos + direction];
    }

    return null;
};

// Iterate over all entries of the part
TOCPart.prototype.walk = function(iter, base) {
    var articles = this.articles;

    if (articles.length == 0) return;

    // Has introduction?
    if (articles[0].isIntro()) {
        if (iter(articles[0], '0') === false) {
            return;
        }

        articles = articles.slice(1);
    }


    _.each(articles, function(article, i) {
        var level = levelId(base, i);

        if (iter(article, level) === false) {
            return false;
        }

        article.walk(iter, level);
    });
};

// Return templating context for a part
TOCPart.prototype.getContext = function(onArticle) {
    onArticle = onArticle || function(article) {
        return article.getContext();
    };

    return {
        title: this.title,
        articles: this.map(onArticle)
    };
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

    .then(function(summary) {
        that.parts = _.map(summary.parts, function(part) {
            return new TOCPart(part, that);
        });

        // Create first part if none
        if (that.parts.length == 0) {
            that.parts.push(new TOCPart({}, that));
        }

        // Add README as first entry
        var firstArticle = that.parts[0].articles[0];
        if (!firstArticle || firstArticle.path != that.book.readme.path) {
            that.parts[0].articles.unshift(new TOCArticle({
                title: 'Introduction',
                path: that.book.readme.path,
                isAutoIntro: true
            }, that.parts[0]));
        }
        that.parts[0].articles[0].isIntroduction = true;

        // Update count of articles and create "level"
        that.update();
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
                return part.getContext(onArticle);
            })
        }
    };
};

// Iterate over all entries of the summary
// iter is called with an TOCArticle
Summary.prototype.walk = function(iter) {
    var hasMultipleParts = this.parts.length > 1;

    _.each(this.parts, function(part, i) {
        part.walk(iter, hasMultipleParts? levelId('', i) : null);
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

// Update the count and indexing of "level"
Summary.prototype.update = function() {
    var that = this;

    that._length = 0;
    that.walk(function(article, level) {
        article.level = level;
        that._length += 1;
    });
};


// Return a level string from a base level and an index
function levelId(base, i) {
    i = i + 1;
    return (base? [base || '', i] : [i]).join('.');
}

module.exports = Summary;
