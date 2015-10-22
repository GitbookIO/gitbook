var $ = require('jquery');
var url = require('url');
var path = require('path');

var state = {};

state.update = function(dom) {
    var $book = $(dom.find('.book'));

    state.$book = $book;
    state.level = $book.data('level');
    state.basePath = $book.data('basepath');
    state.revision = $book.data('revision');

    // Absolute url to the root of the book
    state.root = url.resolve(location.origin, path.dirname(path.resolve(location.pathname, state.basePath)));
};

state.update($);

module.exports = state;
