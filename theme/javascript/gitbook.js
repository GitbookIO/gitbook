define([
    "jQuery",
    "utils/storage",
    "utils/sharing",

    "core/events",
    "core/state",
    "core/keyboard",
    "core/navigation",
    "core/progress",
    "core/sidebar",
    "core/search"
], function($, storage, sharing, events, state, keyboard, navigation, progress, sidebar, search){
    var start = function(config) {
        var $book;
        $book = state.$book;

        if (state.githubId) {
            // Initialize storage
            storage.setBaseKey(state.githubId);
        }

        // Init sidebar
        sidebar.init();

        // Load search
        search.init();

        // Init keyboard
        keyboard.init();

        // Bind sharing button
        sharing.init();
        
        // Init navigation
        navigation.init();

        $(document).trigger("bookReady");

        events.trigger("start", config);
    }

    return {
        start: start,
        events: events
    };
});
