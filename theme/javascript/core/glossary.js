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

    var matchText = function(node, regex, callback, excludeElements) {
        excludeElements || (excludeElements = ['script', 'style', 'iframe', 'canvas']);
        var child = node.firstChild;

        if (!child) return;

        do {
            switch (child.nodeType) {
            case 1:
                if (excludeElements.indexOf(child.tagName.toLowerCase()) > -1) {
                    continue;
                }
                matchText(child, regex, callback, excludeElements);
                break;
            case 3:
               child.data.replace(regex, function(all) {
                    var args = [].slice.call(arguments),
                        offset = args[args.length - 2],
                        newTextNode = child.splitText(offset);

                    newTextNode.data = newTextNode.data.substr(all.length);
                    callback.apply(window, [child].concat(args));
                    child = newTextNode;
                });
                break;
            }
        } while (child = child.nextSibling);

        return node;
    };

    var replaceTerm = function($el, term) {
        var r =  new RegExp( "\\b(" + pregQuote(term.name.toLowerCase()) + ")\\b" , 'gi' );

        matchText($el.get(0), r, function(node, match, offset) {
            var span = document.createElement("span");
            span.className = "glossary-term";
            span.textContent = match;
            span.setAttribute("data-glossary-term", term.id);
            span.setAttribute("title", term.description);
            node.parentNode.insertBefore(span, node.nextSibling);
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