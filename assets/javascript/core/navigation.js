define([
    "jQuery"
], function($) {
    var goNext = function() {
        var url = $("link[rel='next']").attr("href");
        if (url) location.href = url;
    };
    var goPrev = function() {
        var url = $("link[rel='prev']").attr("href");
        if (url) location.href = url;
    };

    return {
        goNext: goNext,
        goPrev: goPrev
    };
});