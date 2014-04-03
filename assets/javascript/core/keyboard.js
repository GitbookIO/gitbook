define([
    "jQuery",
    "Mousetrap",
    "core/navigation"
], function($, Mousetrap, navigation){
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
    };

    return {
        init: init
    };
});