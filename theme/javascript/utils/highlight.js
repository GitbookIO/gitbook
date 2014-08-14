// based on http://bartaz.github.io/sandbox.js/jquery.highlight.html#how
// only do little customisation
define([
        "jQuery"
], function($) {

    var defaultWrapNodeName = "span";
    var defaultHighlightClass = "book-search-highlight";

    var highlight = function(node, keyword, wrapNodeName, className) {
        var regex = generateRegex(keyword);
        if (typeof node === 'undefined' || regex === null) {
            return;
        }
        wrapNodeName = wrapNodeName || defaultWrapNodeName;
        className = className || defaultHighlightClass;
        highlightText(node, regex);

        function highlightText(node, regex) {
            if (node.nodeType === 3) {
                var highlightElement = document.createElement(wrapNodeName);
                highlightElement.className = className;
                var match = regex.exec(node.data);
                if(match) {
                    // split text nodes
                    node.splitText(match.index + match[0].length);
                    var matchedTextNode = node.splitText(match.index);
                    var cloneMatchedTextNode = matchedTextNode.cloneNode(true);
                    // wrap matched text node
                    highlightElement.appendChild(cloneMatchedTextNode);
                    matchedTextNode.parentNode.replaceChild(highlightElement, matchedTextNode);
                    return 1;
                }
            } else if ((node.nodeType === 1 && node.childNodes) && !/(script|style)/i.test(node.tagName)) {
                for(var index = 0; index < node.childNodes.length; index++) {
                    if (!(node.tagName === wrapNodeName.toUpperCase() && node.className === className)) { 
                        // skip new node created by text nodes splitting 
                        index += highlightText(node.childNodes[index], regex, wrapNodeName, className);
                    }
                }
            }
            return 0;
        }

        function generateRegex(keyword) {
            var words = [];
            if (keyword.constructor === String) {
                words = keyword.split(' ');
            } else {
                return null;
            }
            // filter empty string
            words = $.grep(words, function(value, index) {
                return value !== '';
            });
            // escape reserved word
            words = jQuery.map(words, function(value, index) {
                return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            });
            if (words.length === 0) {
               return null;
            }
            var pattern = "(?:" + words.join("|") + ")";
            return new RegExp(pattern, "i");
        }
    };

    var clearHighlight = function(wrapNodeName, className) {
        wrapNodeName = wrapNodeName || defaultWrapNodeName;
        className = className || defaultHighlightClass;
        return $(wrapNodeName + "." + className).each(function () {
            var parent = this.parentNode;
            parent.replaceChild(this.firstChild, this);
            parent.normalize();
        }).end();
    };

    return {
        highlight: highlight,
        clearHighlight: clearHighlight
    };
});
