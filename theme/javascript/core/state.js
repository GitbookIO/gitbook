define([
    "jQuery"
], function() {
    var $book = $(".book");

    return {
      '$book': $book,

      'githubId': $book.data("github"),
      'level': $book.data("level"),
      'basePath': $book.data("basepath"),
      'revision': $book.data("revision")
    };
});