var Q = require('q');
var _ = require('lodash');
var path = require('path');
var cheerio = require('cheerio');

var links = require('./links');
var imgUtils = require('./images');
var fs = require('./fs');

var imgConversionCache = {};

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
    var toConvert = [];
    var outputRoot = options.book.options.output;

    imgConversionCache[outputRoot] = imgConversionCache[outputRoot] || {};

	$("img").each(function() {
        var src = $(this).attr("src");
        var isExternal = links.isExternal(src);

        // Transform as relative to the bases
        if (links.isRelative(src)) {
        	src = links.toAbsolute(src, options.base, options.output);
        }

        // Convert if needed
        if (options.convertImages) {
            var ext = path.extname(src);

            // Test image extension
            if (_.contains(imgUtils.INVALID, ext)) {
                var srcAbs = isExternal? src : path.join("/", options.base, src);

                if (imgConversionCache[outputRoot][srcAbs]) {
                    // Already converted
                    src = imgConversionCache[outputRoot][srcAbs];
                } else {
                    // Not converted yet
                    var dest = "";

                    // Replace extension
                    if (isExternal) {
                        dest = path.basename(src, ext)+".png";
                    } else {
                        dest = path.join(path.dirname(srcAbs), path.basename(srcAbs, ext)+".png");
                        dest = dest[0] == "/"? dest.slice(1) : dest;
                    }

                    // Absolute with input
                    dest = path.resolve(outputRoot, dest);

                    // Get a name that doesn't exists
                    dest = fs.getUniqueFilename(dest);

                    // Reset as relative to book
                    dest = path.relative(outputRoot, dest);

                    options.book.log.debug.ln("detect invalid image (will be converted to png):", srcAbs);

                    // Add to cache
                    imgConversionCache[outputRoot][srcAbs] = "/"+dest;

                    // Push to convert
                    toConvert.push({
                        source: isExternal? srcAbs : path.join("./", srcAbs),
                        dest: path.join("./", dest)
                    });

                    src = dest;
                }

                // Reset as relative to output
                src = links.toAbsolute(src, options.base, options.output);
            }
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
        var includedInFiles = false;

        $("*").each(function() {
            replaceText($, this, r, function(match) {
                if (!includedInFiles) {
                    includedInFiles = true;
                    term.files = term.files || [];
                    term.files.push(options.navigation[options.input]);
                }
                return "<a href='"+links.toAbsolute("GLOSSARY.html", options.base, options.output)+"#"+term.id+"' class='glossary-term' title='"+term.description+"'>"+match+"</span>";
            });
        });
    });

	return {
        html: $.html(),
        images: toConvert
    };
};

// Convert svg images to png
function convertImages(images, options) {
    options.book.log.info.ln("convert ", images.length, "images to png");

    return _.reduce(images, function(prev, image) {
        return prev.then(function() {
            var imgin = links. isExternal(image.source)? image.source : path.resolve(options.book.options.output, image.source);
            var imgout = path.resolve(options.book.options.output, image.dest);

            options.book.log.debug("convert image", image.source, "to", image.dest, "...");

            return imgUtils.convertSVG(imgin, imgout)
            .then(function() {
                options.book.log.debug.ok();
            }, function(err) {
                options.book.log.debug.fail();
                throw err;
            });
        });
    }, Q())
    .then(function() {
        options.book.log.info.ok(images.length+" images converted with success");
    });
};


// Adapt page content to be relative to a base folder
function normalizePage(sections, options) {
	options = _.defaults(options || {}, {
        // Current book
        book: null,

        // Do we need to convert svg?
        convertImages: false,

        // Current file path
        input: ".",

		// Navigation to use to transform path
		navigation: {},

		// Directory parent of the file currently in rendering process
		base: "./",

		// Directory parent from the html output
		output: "./",

        // Glossary terms
        glossary: []
	});

    // List of images to convert
    var toConvert = [];

	sections = _.map(sections, function(section) {
		if (section.type != "normal") return section;

        var out = normalizeHtml(section.content, options);;

        toConvert = toConvert.concat(out.images);
		section.content = out.html;
		return section;
	});

    return Q()
    .then(function() {
        toConvert = _.uniq(toConvert, 'source');
        return convertImages(toConvert, options);
    })
    .thenResolve(sections);
};

// Extract text from sections
function extractText(sections) {
    return _.reduce(sections, function(prev, section) {
        if (section.type != "normal") return prev;

        var $ = cheerio.load(section.content);
        $("*").each(function() {
            prev = prev+" "+$(this).text();
        });

        return prev;
    }, "");
};

module.exports = {
	normalize: normalizePage,
    extractText: extractText
};
