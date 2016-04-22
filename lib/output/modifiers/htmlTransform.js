var Promise = require('../../utils/promise');

/**


*/
function transformTags() {
    var $elements = $(query);

    return Promise.serie($elements, function(el) {
        var $el = that.$(el);
        return fn.call(that, $el);
    });
}

module.exports = transformTags;
