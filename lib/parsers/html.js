var _ = require('lodash');
var cheerio = require('cheerio');

// Parse summary and returns a list of sections
function parseSummary(html) {
    var sections = [];
    var $ = cheerio.load(html);

    // Find main container
    var $body = getContainer($);

    // Extract sections, and parse
    var $lists = $body.find('> ul, > ol');

    $lists.each(function() {
        sections.push({
            articles: parseList($(this), $)
        });
    });

    return sections;
}

// Parse readme and extract title, description
function parseReadme(html) {
    var $ = cheerio.load(html);

    // Find main container
    var $body = getContainer($);

    return {
        title: $body.find('h1:first-child').text().trim(),
        description: $body.find('div.paragraph').first().text().trim()
    };
}

// Return a page container (html, body tag or directly the root element)
function getContainer($) {
    var $body = $('body, html').first();
    if (!$body) $body = $;

    return $body;
}

// Parse a ul list and return list of chapters recursvely
function parseList($ul, $) {
    var articles = [];

    $ul.children('li').each(function() {
        var article = {};

        var $li = $(this);

        var $text = $li.find('> p, > span');
        var $a = $li.find('> a, > p a, > span a');

        article.title = $text.text();
        if ($a.length > 0) {
            article.title = $a.first().text();
            article.ref = $a.attr('href');
        }

        // Inner list, with children article
        var $sub = $li.find('> ol, > ul, > .olist > ol');
        article.articles = parseList($sub, $);

        articles.push(article);
    });

    return articles;
}


// Inherit from the html parser
function inherits(opts) {
    var parser = _.defaults(opts, {
        toHTML: _.identity
    });

    parser.readme = _.compose(opts.toHTML, parseReadme);
    parser.summary = _.compose(opts.toHTML, parseSummary);

    return parser;
}


module.exports = inherits({
    extensions: ['.html']
});
module.exports.inherits = inherits;
