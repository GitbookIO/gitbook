define([
    "jQuery"
], function() {
    var state = {};

    state.update = function(dom) {
        var $book = $(dom.find(".book"));

        state.$book = $book;
        state.githubId = $book.data("github");
        state.level = $book.data("level");
        state.basePath = $book.data("basepath");
        state.revision = $book.data("revision");
    };

    state.update($);

    return state;
});