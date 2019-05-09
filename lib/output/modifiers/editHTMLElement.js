var Promise = require('../../utils/promise');

/**
    Edit all elements matching a selector
*/
function editHTMLElement($, selector, fn) {
    var $elements = $(selector);

    return Promise.forEach($elements, function(el) {
        var $el = $(el);
        return fn($el);
    });
}

module.exports = editHTMLElement;
