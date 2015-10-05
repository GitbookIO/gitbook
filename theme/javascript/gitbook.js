define([
    'jQuery',
    'utils/storage',
    'utils/dropdown',

    'core/events',
    'core/state',
    'core/keyboard',
    'core/navigation',
    'core/progress',
    'core/sidebar',
    'core/search',

    'apis/toolbar'
], function($, storage, dropdown, events, state,
keyboard, navigation, progress, sidebar, search, toolbar){
    var start = function(config) {
        // Init sidebar
        sidebar.init();

        // Load search
        search.init();

        // Init keyboard
        keyboard.init();

        // Bind dropdown
        dropdown.init();

        // Init navigation
        navigation.init();

        events.trigger('start', config);
    };

    // Export APIs for plugins
    return {
        start: start,
        events: events,
        state: state,

        toolbar: toolbar,
        storage: storage
    };
});
