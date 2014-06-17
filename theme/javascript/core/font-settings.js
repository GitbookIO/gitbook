define([
    "jQuery",
    "utils/storage"
], function($, storage) {
    var fontState;

    var THEMES = {
        "white": 0,
        "sepia": 1,
        "night": 2
    };

    var FAMILY = {
        "serif": 0,
        "sans": 1
    };

    var togglePopover = function(e) {
        var $dropdown = $("#font-settings-wrapper .dropdown-menu");

        $dropdown.toggleClass("open");
        e.stopPropagation();
        e.preventDefault();
    };

    var closePopover = function(e) {
        var $dropdown = $("#font-settings-wrapper .dropdown-menu");

        $dropdown.removeClass("open");
    };

    var enlargeFontSize = function(e){
        if (fontState.size < 4){
            fontState.size++;
            fontState.save();
        }
    };

    var reduceFontSize = function(e){
        if (fontState.size > 0){
            fontState.size--;
            fontState.save();
        }
    };

    var changeFontFamily = function(){
        var index = $(this).data("font");

        fontState.family = index;
        fontState.save();
    };

    var changeColorTheme = function(){
        var $book = $(".book");
        var index = $(this).data("theme");

        if (fontState.theme !== 0)
            $book.removeClass("color-theme-"+fontState.theme);

        fontState.theme = index;
        if (fontState.theme !== 0)
            $book.addClass("color-theme-"+fontState.theme);

        fontState.save();
    };

    var update = function() {
        var $book = $(".book");

        $(".font-settings .font-family-list li").removeClass("active");
        $(".font-settings .font-family-list li:nth-child("+(fontState.family+1)+")").addClass("active");

        $book[0].className = $book[0].className.replace(/\bfont-\S+/g, '');
        $book.addClass("font-size-"+fontState.size);
        $book.addClass("font-family-"+fontState.family);

        if(fontState.theme !== 0) {
            $book[0].className = $book[0].className.replace(/\bcolor-theme-\S+/g, '');
            $book.addClass("color-theme-"+fontState.theme);
        }
    };

    var init = function(config) {
        var $toggle, $bookBody, $dropdown, $book;

        //Find DOM elements.
        $book = $(".book");
        $toggle = $(".book-header .toggle-font-settings");
        $dropdown = $("#font-settings-wrapper .dropdown-menu");
        $bookBody = $(".book-body");

        // Instantiate font state object
        fontState = storage.get("fontState", {
            size: config.size || 2,
            family: FAMILY[config.family || "sans"],
            theme: THEMES[config.theme || "white"]
        });
        fontState.save = function(){
            storage.set("fontState",fontState);
            update();
        };

        update();

        //Add event listeners
        $(document).on('click', "#enlarge-font-size", enlargeFontSize);
        $(document).on('click', "#reduce-font-size", reduceFontSize);

        $(document).on('click', "#font-settings-wrapper .font-family-list li", changeFontFamily);
        $(document).on('click', "#font-settings-wrapper .color-theme-list button", changeColorTheme);

        $(document).on('click', ".book-header .toggle-font-settings", togglePopover);
        $(document).on('click', "#font-settings-wrapper .dropdown-menu", function(e){ e.stopPropagation(); });
        $(document).on("click", closePopover);
    };

    return {
        init: init,
        update: update
    }
});