var state = require('./state');

function showLoading(p) {
    state.$book.addClass('is-loading');
    p.always(function() {
        state.$book.removeClass('is-loading');
    });

    return p;
}

module.exports = {
    show: showLoading
};
