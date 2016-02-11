var _ = require('lodash');
var cheerio = require('cheerio');
var domSerializer = require('dom-serializer');
var slug = require('github-slugid');

var Promise = require('../utils/promise');

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
        convertImages: true
    });

    this.$ = cheerio.load(htmlString, {
        // We should parse html without trying to normalize too much
        xmlMode: false,

        // SVG need some attributes to use uppercases
        lowerCaseAttributeNames: false,
        lowerCaseTags: false
    });
}

// Add ID to headings
HTMLPipeline.prototype.addHeadingIDs = function() {
    var that = this;

    this.$('h1,h2,h3,h4,h5,h6').each(function() {
        // Already has an ID?
        if (that.$(this).attr('id')) return;

        that.$(this).attr('id', slug(that.$(this).text()));
    });
};

// Write content to the pipeline
HTMLPipeline.prototype.output = function() {
    var that = this;

    return Promise()
    .then(this.addHeadingIDs)
    .then(function() {
        return renderDOM(that.$);
    });
};

module.exports = HTMLPipeline;
