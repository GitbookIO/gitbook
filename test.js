var path = require('path');

var gitbook = require('./lib');
var NodeFS = require('./lib/fs/node');


var BASE_PATH = path.join(__dirname); //, 'docs');

// Create a filesystem to read the book
var fs = NodeFS(BASE_PATH);

// Create a book instance
var book = gitbook.Book.createForFS(fs);

// Parse the book
gitbook.Parse.parseBook(book)
.then(function(_book) {
    return gitbook.Parse.parsePagesList(_book);
})
.then(function(pages) {
    //console.log('parsed', pages);
}, function(err) {
    console.log('error:', err.stack);
});

