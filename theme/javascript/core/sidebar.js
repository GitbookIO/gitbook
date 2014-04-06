define([
    "utils/storage",
    "utils/platform",
    "core/state",
    "core/search"
], function(storage, platform, state, search) {
    var $summary = state.$book.find(".book-summary");
    var $searchInput = $summary.find(".book-search input")


    // Toggle sidebar with or withour animation
    var toggleSidebar = function(_state, animation) {
        if (state != null && isOpen() == _state) return;
        if (animation == null) animation = true;

        state.$book.toggleClass("without-animation", !animation);
        state.$book.toggleClass("with-summary", _state);

        storage.set("sidebar", isOpen());
    };

    // Toggle search
    var toggleSearch = function(_state) {
        if (state != null && isSearchOpen() == _state) return;

        
        $summary.toggleClass("with-search", _state);

        // If search bar is open: focus input
        if (isSearchOpen()) {
            $searchInput.focus();
        } else {

        }
    };

    // Return true if sidebar is open
    var isOpen = function() {
        return state.$book.hasClass("with-summary");
    };

    // Return true if search bar is open
    var isSearchOpen = function() {
        return $summary.hasClass("with-search");
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

        // Toggle search
        state.$book.find(".book-header .toggle-search").click(function(e) {
            e.preventDefault();
            toggleSearch();
        });

        $searchInput.keyup(function(e) {
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