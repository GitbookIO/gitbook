var path = require('path');
var Q = require('q');
var Book = require('../').Book;

// Nicety for mocha / Q
global.qdone = function qdone(promise, done) {
    return promise.then(function() {
        return done();
    }, function(err) {
        return done(err);
    }).done();
};

// Init before doing tests
before(function(done) {
    global.book1 = new Book(path.join(__dirname, './fixtures/test1'));
    global.book2 = new Book(path.join(__dirname, './fixtures/test2'));

    qdone(
	    global.book1.parse()
	    .then(function() {
	    	return global.book2.parse();
	    }),
	    done
	);
});
