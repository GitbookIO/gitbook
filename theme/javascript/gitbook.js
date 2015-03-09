define([
    "jQuery",
    "utils/storage",
    "utils/sharing",
    "utils/dropdown",

    "core/events",
    "core/font-settings",
    "core/state",
    "core/keyboard",
    "core/navigation",
    "core/progress",
    "core/sidebar",
    "core/search"
], function($, storage, sharing, dropdown, events, fontSettings, state, keyboard, navigation, progress, sidebar, search){
    var start = function(config) {
        var $book;
        $book = state.$book;

        // Init sidebar
        sidebar.init();

        // Load search
        search.init();

        // Init keyboard
        keyboard.init();

        // Bind sharing button
        sharing.init();

        // Bind dropdown
        dropdown.init();

        // Init navigation
        navigation.init();

        //Init font settings
        fontSettings.init(config.fontSettings || {});

        events.trigger("start", config);
    }

    return {
        start: start,
        events: events,
        state: state
    };
});
