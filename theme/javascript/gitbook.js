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

    'apis/toolbar'
], function($, storage, dropdown, events, state,
keyboard, navigation, progress, sidebar, toolbar){
    var start = function(config) {
        // Init sidebar
        sidebar.init();

        // Init keyboard
        keyboard.init();

        // Bind dropdown
        dropdown.init();

        // Init navigation
        navigation.init();


        // Add action to toggle sidebar
        toolbar.createButton({
            icon: 'fa fa-align-justify',
            onClick: function(e) {
                e.preventDefault();
                sidebar.toggle();
            }
        });

        events.trigger('start', config);
    };

    // Export APIs for plugins
    return {
        start: start,
        events: events,
        state: state,

        // UI sections
        toolbar: toolbar,
        sidebar: sidebar,

        // Read/Write the localstorage
        storage: storage,

        // Create keyboard shortcuts
        keyboard: keyboard
    };
});
