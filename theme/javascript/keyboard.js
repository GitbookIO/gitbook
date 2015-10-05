var Mousetrap = require('mousetrap');

var navigation = require('./navigation');
var sidebar = require('./sidebar');

// Bind a keyboard shortcuts
function bindShortcut(keys, fn) {
    Mousetrap.bind(keys, function(e) {
        fn();
        return false;
    });
}


// Bind keyboard shortcuts
function init() {
    // Next
    bindShortcut(['right'], function(e) {
        navigation.goNext();
    });

    // Prev
    bindShortcut(['left'], function(e) {
        navigation.goPrev();
    });

    // Toggle Summary
    bindShortcut(['s'], function(e) {
        sidebar.toggle();
    });
}

module.exports = {
    init: init,
    bind: bindShortcut
};
