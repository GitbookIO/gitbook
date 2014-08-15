define([
    "jQuery",
    "lodash",
    "lunr",
    "utils/storage",
    "utils/highlight",
    "core/state",
    "core/sidebar"
], function($, _, lunr, storage, highlight, state, sidebar) {
    var index = null;

    // Use a specific idnex
    var useIndex = function(data) {
        index = lunr.Index.load(data);
    };

    // Load complete index
    var loadIndex = function() {
        $.getJSON(state.basePath+"/search_index.json")
        .then(useIndex);
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

        var $searchInput = $(".book-search input");
        state.$book.toggleClass("with-search", _state);

        // If search bar is open: focus input
        if (isSearchOpen()) {
            sidebar.toggle(true);
            $searchInput.focus();
        } else {
            $searchInput.blur();
            $searchInput.val("");
            sidebar.filter(null);
            highlight.clearHighlight();
        }
    };

    // Return true if search bar is open
    var isSearchOpen = function() {
        return state.$book.hasClass("with-search");
    };


    var init = function() {
        loadIndex();

        // Toggle search
        $(document).on("click", ".book-header .toggle-search", function(e) {
            e.preventDefault();
            toggleSearch();
        });


        // Type in search bar
        $(document).on("keyup", ".book-search input", function(e) {
            var key = (e.keyCode ? e.keyCode : e.which);
            var q = $(this).val();

            if (key == 27) {
                e.preventDefault();
                toggleSearch(false);
                return;
            }
            if (q.length == 0) {
                sidebar.filter(null);
                storage.remove("keyword");
            } else {
                var results = search(q);
                sidebar.filter(
                    _.pluck(results, "path")
                );
                storage.set("keyword", q);
                highlight.highlight($('div.book-body')[0], q);
            }
        })

    };

    // filter sidebar menu with current search keyword
    var recoverSearch = function() {
        var keyword = storage.get("keyword", "");
        if(keyword.length > 0) {
            if(!isSearchOpen()) {
                toggleSearch();
            }
            sidebar.filter(_.pluck(search(keyword), "path"));
        }
        $(".book-search input").val(keyword);
        highlight.highlight($('div.book-body')[0], keyword);
    };

    return {
        init: init,
        search: search,
        toggle: toggleSearch,
        recover:recoverSearch
    };
});
