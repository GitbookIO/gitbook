define([
    "jQuery"
], function($) {

    var toggleDropdown = function(e) {
        var $dropdown = $(e.currentTarget).parent().find(".dropdown-menu");

        $dropdown.toggleClass("open");
        e.stopPropagation();
        e.preventDefault();
    };

    var closeDropdown = function(e) {
        $(".dropdown-menu").removeClass("open");
    };

    // Bind all dropdown
    var init = function() {
        $(document).on('click', ".toggle-dropdown", toggleDropdown);
        $(document).on('click', ".dropdown-menu", function(e){ e.stopPropagation(); });
        $(document).on("click", closeDropdown);
    };

    return {
        init: init
    };
});
