define([
    "utils/storage",
    "utils/platform",
    "core/state"
], function(storage, platform, state) {
    var $summary = state.$book.find(".book-summary");

    // Toggle sidebar with or withour animation
    var toggleSidebar = function(_state, animation) {
        if (state != null && isOpen() == _state) return;
        if (animation == null) animation = true;

        state.$book.toggleClass("without-animation", !animation);
        state.$book.toggleClass("with-summary", _state);

        storage.set("sidebar", isOpen());
    };

    // Return true if sidebar is open
    var isOpen = function() {
        return state.$book.hasClass("with-summary");
    };

    // Prepare sidebar: state and toggle button
    var init = function() {
        // Toggle summary
        state.$book.find(".book-header .toggle-summary").click(function(e) {
            e.preventDefault();
            toggleSidebar();
        });

        // Init last state if not mobile
        if (!platform.isMobile) {
            toggleSidebar(storage.get("sidebar", true), false);
        }
    };

    return {
        $el: $summary,
        init: init,
        toggle: toggleSidebar
    }
});