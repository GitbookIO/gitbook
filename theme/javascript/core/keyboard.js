define([
    'jQuery',
    'Mousetrap',
    'core/navigation',
    'core/sidebar'
], function($, Mousetrap, navigation, sidebar){

    // Bind a keyboard shortcuts
    function bindShortcut(keys, fn) {
        Mousetrap.bind(keys, function(e) {
            fn();
            return false;
        });
    }


    // Bind keyboard shortcuts
    var init = function() {
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
    };

    return {
        init: init,
        bind: bindShortcut
    };
});