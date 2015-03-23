var Q = require('q');
var _ = require('lodash');
var url = require('url');
var path = require('path');
var cheerio = require('cheerio');
var domSerializer = require('dom-serializer');
var request = require('request');
var crc = require("crc");

var links = require('./links');
var imgUtils = require('./images');
var fs = require('./fs');
var batch = require('./batch');
var code = require('./code');

// Render a cheerio dom as html
var renderDom = function($, dom, options) {
    if (!dom && $._root && $._root.children) {
        dom = $._root.children;
    }

    options = options|| dom.options || $._options;
    return domSerializer(dom, options);
};

// Map of images that have been converted
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
    var $ = cheerio.load(src, {
        // We should parse html without trying to normalize too much
        xmlMode: false,

        // SVG need some attributes to use uppercases
        lowerCaseAttributeNames: false,
        lowerCaseTags: false
    });
    var toConvert = [];
    var svgContent = {};
    var outputRoot = options.book.options.output;

    imgConversionCache[outputRoot] = imgConversionCache[outputRoot] || {};

    // Find svg images to extract and process
    if (options.convertImages) {
        $("svg").each(function() {
            var content = renderDom($, $(this));
            var svgId = _.uniqueId("svg");
            var dest = svgId+".svg";

            // Generate filename
            dest = "/"+fs.getUniqueFilename(outputRoot, dest);

            svgContent[dest] = '<?xml version="1.0" encoding="UTF-8"?>'+content;
            $(this).replaceWith($("<img>").attr("src", dest));
        });
    }

    // Find images to normalize
    $("img").each(function() {
        var origin = undefined;
        var src = $(this).attr("src");
        if (!src) return;
        var isExternal = links.isExternal(src);

        // Transform as relative to the bases
        if (links.isRelative(src)) {
            src = links.toAbsolute(src, options.base, options.output);
        }

        // Convert if needed
        if (options.convertImages) {
            // If image is external and ebook, then downlaod the images
            if (isExternal) {
                origin = src;
                src = "/"+crc.crc32(origin).toString(16)+path.extname(origin);
                src = links.toAbsolute(src, options.base, options.output);
                isExternal = false;
            }

            var ext = path.extname(src);
            var srcAbs = links.join("/", options.base, src);

            // Test image extension
            if (_.contains(imgUtils.INVALID, ext)) {
                if (imgConversionCache[outputRoot][srcAbs]) {
                    // Already converted
                    src = imgConversionCache[outputRoot][srcAbs];
                } else {
                    // Not converted yet
                    var dest = "";

                    // Replace extension
                    dest = links.join(path.dirname(srcAbs), path.basename(srcAbs, ext)+".png");
                    dest = dest[0] == "/"? dest.slice(1) : dest;

                    // Get a name that doesn't exists
                    dest = fs.getUniqueFilename(outputRoot, dest);

                    options.book.log.debug.ln("detect invalid image (will be converted to png):", srcAbs);

                    // Add to cache
                    imgConversionCache[outputRoot][srcAbs] = "/"+dest;

                    // Push to convert
                    toConvert.push({
                        origin: origin,
                        content: svgContent[srcAbs],
                        source: isExternal? srcAbs : path.join("./", srcAbs),
                        dest: path.join("./", dest)
                    });

                    src = links.join("/", dest);
                }

                // Reset as relative to output
                src = links.toAbsolute(src, options.base, options.output);
            }

            else if (origin) {
                // Need to downlaod image
                toConvert.push({
                    origin: origin,
                    source: path.join("./", srcAbs)
                });
            }
        }

        $(this).attr("src", src);
    });

    // Normalize links
    $("a").each(function() {
        var href = $(this).attr("href");
        if (!href) return;

        if (links.isAnchor(href)) {
            // Keep it as it is
        } else if (links.isRelative(href)) {
            var parts = url.parse(href);
            var absolutePath = path.join(options.base, parts.pathname);
            var anchor = parts.hash || "";

            // If is in navigation relative: transform as content
            if (options.navigation[absolutePath]) {
                absolutePath = options.book.contentLink(absolutePath);
            }

            // Transform as absolute
            href = links.toAbsolute("/"+absolutePath, options.base, options.output)+anchor;
        } else {
            // External links
            $(this).attr("target", "_blank");
        }

        // Transform extension
        $(this).attr("href", href);
    });

    // Highlight code blocks
    $("code").each(function() {
        // Extract language
        var lang = _.chain(
                ($(this).attr("class") || "").split(" ")
            )
            .map(function(cl) {
                if (cl.search("lang-") === 0) return cl.slice("lang-".length);
                return null;
            })
            .compact()
            .first()
            .value();

        if (lang) {
            var html = code.highlight(
                lang,
                $(this).text()
            );

            $(this).html(html);
        }
    });

    // Replace glossary terms
    _.each(options.glossary, function(term) {
        var r =  new RegExp( "\\b(" + pregQuote(term.name.toLowerCase()) + ")\\b" , 'gi' );
        var includedInFiles = false;

        $("*").each(function() {
            // Ignore codeblocks
            if (_.contains(["code", "pre"], this.name.toLowerCase())) return;

            replaceText($, this, r, function(match) {
                // Add to files index in glossary
                if (!includedInFiles) {
                    includedInFiles = true;
                    term.files = term.files || [];
                    term.files.push(options.navigation[options.input]);
                }
                return "<a href='"+links.toAbsolute("/GLOSSARY.html", options.base, options.output)+"#"+term.id+"' class='glossary-term' title='"+_.escape(term.description)+"'>"+match+"</a>";
            });
        });
    });

    return {
        html: renderDom($),
        images: toConvert
    };
};

// Convert svg images to png
function convertImages(images, options) {
    if (!options.convertImages) return Q();

    var downloaded = [];
    options.book.log.debug.ln("convert ", images.length, "images to png");

    return batch.execEach(images, {
        max: 100,
        fn: function(image) {
            var imgin = path.resolve(options.book.options.output, image.source);

            return Q()

            // Write image if need to be download
            .then(function() {
                if (!image.origin && !_.contains(downloaded, image.origin)) return;
                options.book.log.debug("download image", image.origin, "...");
                downloaded.push(image.origin);
                return options.book.log.debug.promise(fs.writeStream(imgin, request(image.origin)));
            })

            // Write svg if content
            .then(function() {
                if (!image.content) return;
                return fs.writeFile(imgin, image.content);
            })

            // Convert
            .then(function() {
                if (!image.dest) return;
                var imgout = path.resolve(options.book.options.output, image.dest);
                options.book.log.debug("convert image", image.source, "to", image.dest, "...");
                return options.book.log.debug.promise(imgUtils.convertSVG(imgin, imgout));
            });
        }
    })
    .then(function() {
        options.book.log.debug.ok(images.length+" images converted with success");
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
