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
        // Calcul new href for a relative link
        onRelativeLink: _.identity,

        // Output an image
        onImage: _.identity,

        // Output a svg, if returns null the svg is kept inlined
        onOutputSVG: _.constant(null)
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

// Normalize images
HTMLPipeline.prototype.normalizeImages = function() {
    var that = this;

    var $imgs = this.$('img');

    return Promise.serie($imgs, function(img) {
        var $img = that.$(img);

        return Promise(that.opts.onImage($img.attr('src')))
        .then(function(filename) {
            $img.attr('src', filename);
        });
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

// Outline SVG from the HML
HTMLPipeline.prototype.outlineSVG = function() {
    var that = this;

    var $svgs = this.$('svg');

    return Promise.serie($svgs, function(svg) {
        var $svg = that.$(svg);
        var content = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            renderDOM(that.$, $svg)
        ].join('\n');

        return Promise(that.opts.onOutputSVG(content))
        .then(function(filename) {
            if (!filename) return;

            $svg.replaceWith(that.$('<img>').attr('src', filename));
        });
    });
};

// Write content to the pipeline
HTMLPipeline.prototype.output = function() {
    var that = this;

    return Promise()
    .then(this.normalizeLinks)
    .then(this.normalizeImages)
    .then(this.addHeadingIDs)
    .then(this.outlineSVG)
    .then(function() {
        return renderDOM(that.$);
    });
};

module.exports = HTMLPipeline;
