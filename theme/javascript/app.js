require([
    "jQuery",
    "utils/storage",
    "utils/sharing",

    "core/global",
    "core/state",
    "core/keyboard",
    "core/navigation",
    "core/progress",
    "core/sidebar",
    "core/search"
], function($, storage, sharing, global, state, keyboard, navigation, progress, sidebar, search){
    $(document).ready(function() {
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

        global.trigger("init");
    });
});
