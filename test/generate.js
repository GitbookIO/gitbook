var _ = require('lodash');
var Q = require('q');
var path = require('path');
var tmp = require('tmp');
var assert = require('assert');

var generate = require("../lib/generate");

var generateTmpBook = function(path) {
    return ;
};


var BOOKS = {
    "book1": true,
    "book2": false
};

describe('Site Generation', function () {
    var ret = {};

    beforeEach(function(done){
        Q.all(_.map(BOOKS, function(state, bookName) {
            return Q.nfcall(tmp.dir)
            .then(function(_dir) {
                return generate.folder({
                    input: path.join(__dirname, "fixtures", bookName),
                    output: _dir
                });
            })
            .then(function(_book) {
                ret[bookName] = _book;
            }, function(err) {
                // ignore errors here
            });
        }))
        .fin(done);
    });


    it('should generate the valid sites', function() {
        _.each(BOOKS, function(state, bookName) {
            assert((ret[bookName] != null) == state);
        });
    });
});
