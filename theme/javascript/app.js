require([
    "jQuery",
    "utils/storage",
    "utils/analytic",
    "utils/sharing",

    "core/state",
    "core/keyboard",
    "core/navigation",
    "core/progress",
    "core/sidebar",
    "core/search",
    "core/font-settings"
], function($, storage, analytic, sharing, state, keyboard, navigation, progress, sidebar, search, fontSettings){
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

        //Init font settings 
        fontSettings.init();
    });
});
