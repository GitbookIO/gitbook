define([
    "utils/storage",
    "utils/platform",
    "core/state",
    "core/search"
], function(storage, platform, state, search) {

    // Toggle sidebar with or withour animation
    var toggleSidebar = function(_state, animation) {
        if (state != null && isOpen() == _state) return;
        if (animation == null) animation = true;

        var $book = state().$book;
        $book.toggleClass("without-animation", !animation);
        $book.toggleClass("with-summary", _state);

        storage.set("sidebar", isOpen());
    };

    // Toggle search
    var toggleSearch = function(_state) {
        if (state != null && isSearchOpen() == _state) return;

        var $summary = state().$book.find(".book-summary");
        $summary.toggleClass("with-search", _state);

        // If search bar is open: focus input
        if (isSearchOpen()) $summary.find(".book-search input").focus();
    };

    // Return true if sidebar is open
    var isOpen = function() {
        return state().$book.hasClass("with-summary");
    };

    // Return true if search bar is open
    var isSearchOpen = function() {
        return state().$book.find(".book-summary").hasClass("with-search");
    };

    // Prepare sidebar: state and toggle button
    var init = function() {
        var $book = state().$book;

        // Toggle summary
        $book.find(".book-header .toggle-summary").click(function(e) {
            e.preventDefault();
            toggleSidebar();
        });

        // Init last state if not mobile
        if (!platform.isMobile) {
            toggleSidebar(storage.get("sidebar", true), false);
        }

        // Toggle search
        $book.find(".book-header .toggle-search").click(function(e) {
            e.preventDefault();
            toggleSearch();
        });

        $book.find(".book-summary .book-search input").keyup(function(e) {
            var key = (e.keyCode ? e.keyCode : e.which);
            var q = $(this).val();

            if (key == 27) {
                e.preventDefault();
                toggleSearch(false);
                return;
            }
            console.log("search", q);
        });
    };

    return {
        init: init,
        toggle: toggleSidebar,
        toggleSearch: toggleSearch
    }
});