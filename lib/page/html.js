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

        // Syntax highlighting
        onCodeBlock: _.identity,

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

// Transform a query of elements in the page
HTMLPipeline.prototype._transform = function(query, fn) {
    var that = this;

    var $elements = this.$(query);

    return Promise.serie($elements, function(el) {
        var $el = that.$(el);
        return fn.call(that, $el);
    });
};

// Normalize links
HTMLPipeline.prototype.transformLinks = function() {
    return this._transform('a', function($a) {
        var href = $a.attr('href');
        if (!href) return;

        if (location.isAnchor(href)) {
            // Don't "change" anchor links
        } else if (location.isRelative(href)) {
            $a.attr('href', this.opts.onRelativeLink(href));
        } else {
            // External links
            $a.attr('target', '_blank');
        }
    });
};

// Normalize images
HTMLPipeline.prototype.transformImages = function() {
    return this._transform('img', function($img) {
        return Promise(this.opts.onImage($img.attr('src')))
        .then(function(filename) {
            $img.attr('src', filename);
        });
    });
};

// Normalize code blocks
HTMLPipeline.prototype.transformCodeBlocks = function() {
    return this._transform('code', function($code) {
        // Extract language
        var lang = _.chain(
                ($code.attr('class') || '').split(' ')
            )
            .map(function(cl) {
                // Markdown
                if (cl.search('lang-') === 0) return cl.slice('lang-'.length);

                // Asciidoc
                if (cl.search('language-') === 0) return cl.slice('language-'.length);

                return null;
            })
            .compact()
            .first()
            .value();

        var source = $code.text();

        return Promise(this.opts.onCodeBlock(source, lang))
        .then(function(blk) {
            if (blk.html === false) {
                $code.text(blk.body);
            } else {
                $code.html(blk.body);
            }
        });
    });
};

// Add ID to headings
HTMLPipeline.prototype.transformHeadings = function() {
    var that = this;

    this.$('h1,h2,h3,h4,h5,h6').each(function() {
        var $h = that.$(this);

        // Already has an ID?
        if ($h.attr('id')) return;
        $h.attr('id', slug($h.text()));
    });
};

// Outline SVG from the HML
HTMLPipeline.prototype.transformSvgs = function() {
    return this._transform('svg', function($svg) {
        var content = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            renderDOM(this.$, $svg)
        ].join('\n');

        return Promise(this.opts.onOutputSVG(content))
        .then(function(filename) {
            if (!filename) return;

            $svg.replaceWith(this.$('<img>').attr('src', filename));
        });
    });
};

// Write content to the pipeline
HTMLPipeline.prototype.output = function() {
    var that = this;

    return Promise()
    .then(this.transformLinks)
    .then(this.transformImages)
    .then(this.transformHeadings)
    .then(this.transformCodeBlocks)
    .then(this.transformSvgs)
    .then(function() {
        return renderDOM(that.$);
    });
};

module.exports = HTMLPipeline;
