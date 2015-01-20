define([
    "jQuery",
    "lodash",
    "core/state"
], function($, _, state) {
    var index = null;

    // Use a specific idnex
    var useIndex = function(data) {
        index = data;
    };

    // Load complete index
    var loadIndex = function() {
        return $.getJSON(state.basePath+"/glossary_index.json")
        .then(useIndex);
    };

    // Get index and return a promise
    var getIndex = function() {
        var d = $.Deferred();

        if (index) {
            d.resolve(index);
        } else {
            loadIndex().done(function(){
                d.resolve(index);
            }).fail(d.reject);
        }

        return d.promise();
    }

    $.fn.replaceText = function( search, replace, text_only ) {
        return this.each(function(){
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

    var pregQuote = function( str ) {
        return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
    };

    var init = function() {
        // Bind click on glossary item
        $(document).on("click", ".book-body .page-wrapper .page-inner .glossary-term", function(e) {
            e.preventDefault();

            location.href = state.basePath+"/GLOSSARY.html#"+$(e.currentTarget).data("glossary-term");
        });
    };

    var replaceTerm = function($el, term) {
        var r =  new RegExp( "\\b(" + pregQuote(term.name.toLowerCase()) + ")\\b" , 'gi' );

        $el.find("*").replaceText(r, function(match) {
            return "<span class='glossary-term' data-glossary-term='"+term.id+"' title='"+term.description+"'>"+match+"</span>";
        });

    };

    var prepare = function() {
        getIndex()
        .done(function() {
            _.each(index, _.partial(replaceTerm, $(".book-body .page-wrapper .page-inner")));
        });
    };

    return {
        init: init,
        prepare: prepare
    };
});