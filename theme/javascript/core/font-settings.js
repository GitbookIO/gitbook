define([
    "jQuery",
    "utils/storage"
], function($, storage) {
    var fontState;

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
        var $bookBody = $(".book-body");

        if (fontState.size < 4){
            $bookBody.toggleClass("font-size-"+fontState.size, false);
            fontState.size++;

            $bookBody.toggleClass("font-size-"+fontState.size, true);
            fontState.save();
        }
    };
    
    var reduceFontSize = function(e){
        var $bookBody = $(".book-body");

        if (fontState.size > 0){
            $bookBody.toggleClass("font-size-"+fontState.size);
            fontState.size--;

            $bookBody.toggleClass("font-size-"+fontState.size);
            fontState.save();
        }
    };

    var changeFontFamily = function(){
        var $bookBody = $(".book-body");
        var index = $(this).data("font");

        $bookBody.toggleClass("font-family-"+fontState.family);
        $(".font-settings .font-family-list li:nth-child("+(fontState.family+1)+")")
            .removeClass("active");

        fontState.family = index;
        $bookBody.toggleClass("font-family-"+fontState.family);
        $(this).addClass("active");
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

    var init = function() {
        var $toggle, $bookBody, $dropdown, $book;

        //Find DOM elements.
        $book = $(".book");
        $toggle = $(".book-header .toggle-font-settings");
        $dropdown = $("#font-settings-wrapper .dropdown-menu");
        $bookBody = $(".book-body");

        //Instantiate font state object 
        fontState = storage.get("fontState", {
            size:1,
            family:0,
            theme:0
        });
        fontState.save = function(){
            storage.set("fontState",fontState);
        };

        $bookBody.addClass("font-size-"+fontState.size);
        $bookBody.addClass("font-family-"+fontState.family);

        $(".font-settings .font-family-list li:nth-child("+(fontState.family+1)+")").addClass("active");

        if(fontState.theme !== 0)
            $book.addClass("color-theme-"+fontState.theme);

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
        init: init
    }
});