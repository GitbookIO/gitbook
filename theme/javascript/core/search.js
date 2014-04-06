define([
    "jQuery",
    "lodash",
    "lunr",
    "core/state",
    "core/sidebar"
], function($, _, lunr, state, sidebar) {
    var index = null;
    var $searchInput = sidebar.$el.find(".book-search input");

    // Load complete index
    var loadIndex = function() {
        return $.getJSON("search_index.json")
        .then(function(data) {
            index = lunr.Index.load(data);
        });
    };

    // Search for a term
    var search = function(q) {
        if (!index) return;
        var results = _.chain(index.search(q))
        .map(function(result) {
            var parts = result.ref.split("#")
            return {
                path: parts[0],
                hash: parts[1]
            }
        })
        .value();

        return results;
    };

    // Toggle search bar
    var toggleSearch = function(_state) {
        if (state != null && isSearchOpen() == _state) return;

        
        sidebar.$el.toggleClass("with-search", _state);

        // If search bar is open: focus input
        if (isSearchOpen()) {
            $searchInput.focus();
        } else {
            $searchInput.blur();
        }
    };

    // Return true if search bar is open
    var isSearchOpen = function() {
        return sidebar.$el.hasClass("with-search");
    };


    var init = function() {
        loadIndex();

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
        search: search,
        toggle: toggleSearch
    };
});