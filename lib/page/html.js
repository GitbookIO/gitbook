var _ = require('lodash');
var cheerio = require('cheerio');
var domSerializer = require('dom-serializer');
var slug = require('github-slugid');

var Promise = require('../utils/promise');
var location = require('../utils/location');

// Render a cheerio DOM as html
function renderDOM($, dom, options) {
    if (!dom && $._root && $._root.children) {
        dom = $._root.children;
    }
    options = options|| dom.options || $._options;
    return domSerializer(dom, options);
}

function HTMLPipeline(htmlString, opts) {
    _.bindAll(this);

    this.opts = _.defaults(opts || {}, {
        convertImages: true,

        // Calcul new href for a relative link
        onRelativeLink: _.identity
    });

    this.$ = cheerio.load(htmlString, {
        // We should parse html without trying to normalize too much
        xmlMode: false,

        // SVG need some attributes to use uppercases
        lowerCaseAttributeNames: false,
        lowerCaseTags: false
    });
}

// Normalize links
HTMLPipeline.prototype.normalizeLinks = function() {
    var that = this;

    this.$('a').each(function() {
        var $a = that.$(this);

        var href = $a.attr('href');
        if (!href) return;

        if (location.isAnchor(href)) {
            // Don't "change" anchor links
        } else if (location.isRelative(href)) {
            $a.attr('href', that.opts.onRelativeLink(href));
        } else {
            // External links
            $a.attr('target', '_blank');
        }

    });
};

// Add ID to headings
HTMLPipeline.prototype.addHeadingIDs = function() {
    var that = this;

    this.$('h1,h2,h3,h4,h5,h6').each(function() {
        var $h = that.$(this);

        // Already has an ID?
        if ($h.attr('id')) return;
        $h.attr('id', slug($h.text()));
    });
};

// Write content to the pipeline
HTMLPipeline.prototype.output = function() {
    var that = this;

    return Promise()
    .then(this.normalizeLinks)
    .then(this.addHeadingIDs)
    .then(function() {
        return renderDOM(that.$);
    });
};

module.exports = HTMLPipeline;
