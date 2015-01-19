var _ = require('lodash');
var path = require('path');
var cheerio = require('cheerio');

var links = require('./links');

// Adapt an html snippet to be relative to a base folder
function normalizeHtml(src, options) {
	var $ = cheerio.load(src);

	$("img").each(function() {
        var src = $(this).attr("src");

        // Transform as absolute
        if (links.isRelative(src)) {
        	src = links.toAbsolute(src, options.base, options.output);
        }

        $(this).attr("src", src);
    });

    $("a").each(function() {
        var href = $(this).attr("href");

        if (links.isRelative(href)) {
        	var absolutePath = path.join(options.base, href);

        	// If is in navigation relative: change extsnio nto be .html
        	if (options.navigation[absolutePath]) href = links.changeExtension(href, ".html");

        	// Transform as absolute
        	href = links.toAbsolute(href, options.base, options.output);
        } else {
        	$(this).attr("target", "_blank");
        }

        // Transform extension
        $(this).attr("href", href);
    });

	return $.html();
};

// Adapt page content to be relative to a base folder
function normalizePage(sections, options) {
	options = _.defaults(options || {}, {
		// Navigation to use to transform path
		navigation: {},

		// Directory parent of the file currently in rendering process
		base: "./",

		// Directory parent from the html output
		output: "./"
	});

	return _.map(sections, function(section) {
		if (section.type != "normal") return section;
		section.content = normalizeHtml(section.content, options);
		return section;
	});
};

module.exports = {
	normalize: normalizePage
};
