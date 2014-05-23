define([
    "jQuery"
], function($) {
    var showLoading = function(p) {
        $(".book").addClass("is-loading");
        p.always(function() {
            $(".book").removeClass("is-loading");
        });

        return p;
    };

    return {
        show: showLoading
    };
});