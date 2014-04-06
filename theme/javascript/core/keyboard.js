define([
    "jQuery",
    "Mousetrap",
    "core/navigation",
    "core/sidebar",
    "core/search"
], function($, Mousetrap, navigation, sidebar, search){
    // Bind keyboard shortcuts
    var init = function() {
        // Next
        Mousetrap.bind(['right'], function(e) {
            navigation.goNext();
            return false;
        });

        // Prev
        Mousetrap.bind(['left'], function(e) {
            navigation.goPrev();
            return false;
        });

        // Toggle Summary
        Mousetrap.bind(['s'], function(e) {
            sidebar.toggle();
            return false;
        });

        // Toggle Search
        Mousetrap.bind(['f'], function(e) {
            search.toggle();
            return false;
        });
    };

    return {
        init: init,
        search: search
    };
});