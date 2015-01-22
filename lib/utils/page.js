var _ = require('lodash');
var path = require('path');
var cheerio = require('cheerio');

var links = require('./links');

function replaceText($, el, search, replace, text_only ) {
    return $(el).each(function(){
        var node = this.firstChild,
            val,
            new_val,

            // Elements to be removed at the end.
            remove = [];

        // Only continue if firstChild exists.
        if ( node ) {

            // Loop over all childNodes.
            do {
                // Only process text nodes.
                if ( node.nodeType === 3 ) {

                    // The original node value.
                    val = node.nodeValue;

                    // The new value.
                    new_val = val.replace( search, replace );

                    // Only replace text if the new value is actually different!
                    if ( new_val !== val ) {

                        if ( !text_only && /</.test( new_val ) ) {
                            // The new value contains HTML, set it in a slower but far more
                            // robust way.
                            $(node).before( new_val );

                            // Don't remove the node yet, or the loop will lose its place.
                            remove.push( node );
                        } else {
                            // The new value contains no HTML, so it can be set in this
                            // very fast, simple way.
                            node.nodeValue = new_val;
                        }
                    }
                }

            } while ( node = node.nextSibling );
        }

        // Time to remove those elements!
        remove.length && $(remove).remove();
    });
};

function pregQuote( str ) {
    return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
};


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

    // Replace glossayr terms
    _.each(options.glossary, function(term) {
        var r =  new RegExp( "\\b(" + pregQuote(term.name.toLowerCase()) + ")\\b" , 'gi' );

        $("*").each(function() {
            replaceText($, this, r, function(match) {
                return "<a href='"+links.toAbsolute("GLOSSARY.html", options.base, options.output)+"#"+term.id+"' class='glossary-term' title='"+term.description+"'>"+match+"</span>";
            });
        });
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
		output: "./",

        // Glossary terms
        glossary: []
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
