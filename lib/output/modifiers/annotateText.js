var escape = require('escape-html');

// Selector to ignore
var ANNOTATION_IGNORE = '.no-glossary,code,pre,a,script,h1,h2,h3,h4,h5,h6';

function pregQuote( str ) {
    return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, '\\$1');
}

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
            while (node) {

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

                node = node.nextSibling;
            }
        }

        // Time to remove those elements!
        if (remove.length) $(remove).remove();
    });
}

/**
 * Annotate text using a list of GlossaryEntry
 *
 * @param {List<GlossaryEntry>}
 * @param {String} glossaryFilePath
 * @param {HTMLDom} $
 */
function annotateText(entries, glossaryFilePath, $) {
    entries.forEach(function(entry) {
        var entryId     = entry.getID();
        var name        = entry.getName();
        var description = entry.getDescription();
        var searchRegex = new RegExp( '\\b(' + pregQuote(name.toLowerCase()) + ')\\b' , 'gi' );

        $('*').each(function() {
            var $this = $(this);

            if (
                $this.is(ANNOTATION_IGNORE) ||
                $this.parents(ANNOTATION_IGNORE).length > 0
            ) return;

            replaceText($, this, searchRegex, function(match) {
                return '<a href="/' + glossaryFilePath + '#' + entryId + '" '
                    + 'class="glossary-term" title="' + escape(description) + '">'
                    + match
                    + '</a>';
            });
        });

    });
}

module.exports = annotateText;
