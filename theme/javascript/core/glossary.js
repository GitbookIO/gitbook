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

    var pregQuote = function( str ) {
        // http://kevin.vanzonneveld.net
        // +   original by: booeyOH
        // +   improved by: Ates Goral (http://magnetiq.com)
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Onno Marsman
        // *     example 1: preg_quote("$40");
        // *     returns 1: '\$40'
        // *     example 2: preg_quote("*RRRING* Hello?");
        // *     returns 2: '\*RRRING\* Hello\?'
        // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
        // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'

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

        $el.find("p:contains('"+term.name+"')").each( function( i, element ) {
            element = $(element);
            var content = $(element).html();

            content = content.replace(r, '<span class="glossary-term" data-glossary-term="' + term.id + '" title="' + term.description + '">$1</span>');
            element.html(content);
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