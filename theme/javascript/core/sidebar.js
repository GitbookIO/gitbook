define([
    "utils/storage",
    "utils/platform",
    "core/state"
], function(storage, platform, state) {

    // Toggle sidebar with or withour animation
    var toggleSidebar = function(_state, animation) {
        if (-state != null && isOpen() == _state) return;
        if (animation == null) animation = true;

        var $book = state().$book;
        $book.toggleClass("without-animation", !animation);
        $book.toggleClass("with-summary", _state);

        storage.set("sidebar", isOpen());
    };

    // Return true if sidebar is open
    var isOpen = function() {
        return state().$book.hasClass("with-summary");
    };

    // Prepare sidebar: state and toggle button
    var init = function() {
        var $book = state().$book;

        // Toggle summary
        $book.find(".book-header .toggle-summary").click(function(e) {
            e.preventDefault();
            toggleSidebar();
        });

        // Init last state if not mobile and not homepage
        toggleSidebar(platform.isMobile ? false : storage.get("sidebar", true), false);
    };

    return {
        init: init,
        toggle: toggleSidebar
    }
});