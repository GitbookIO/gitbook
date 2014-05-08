define([
    "jQuery",
    "utils/storage",
    "utils/sharing",
    "utils/appcache",

    "core/events",
    "core/font-settings",
    "core/state",
    "core/keyboard",
    "core/navigation",
    "core/progress",
    "core/sidebar",
    "core/search"
], function($, storage, appCache, sharing, events, fontSettings, state, keyboard, navigation, progress, sidebar, search){
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

        // Init appcache
        appCache.init();

        // Bind sharing button
        sharing.init();

        // Init navigation
        navigation.init();

        //Init font settings
        fontSettings.init(config.fontSettings || {});

        events.trigger("start", config);
    }

    return {
        start: start,
        events: events
    };
});
