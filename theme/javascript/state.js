var $ = require('jquery');

var state = {};

state.update = function(dom) {
    var $book = $(dom.find(".book"));

    state.$book = $book;
    state.level = $book.data("level");
    state.basePath = $book.data("basepath");
    state.revision = $book.data("revision");
};

state.update($);

module.exports = state;
