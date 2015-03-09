var path = require('path');
var _ = require('lodash');
var assert = require('assert');
var fs = require("fs");

var pkg = require("../package.json");

describe('Templating', function () {
    before(function(done) {
        testGeneration(books[0], "website", function(output) {}, done);
    });

    var testTpl = function(str, args, options) {
        return books[0].template.renderString(str, args, options)
        .then(books[0].template.postProcess)
    };

    it('should correctly have access to generator', function(done) {
        qdone(
            testTpl('{{ gitbook.generator }}')
            .then(function(content) {
                assert.equal(content, "website");
            }),
            done
        );
    });

    it('should correctly have access to gitbook version', function(done) {
        qdone(
            testTpl('{{ gitbook.version }}')
            .then(function(content) {
                assert.equal(content, pkg.version.toString());
            }),
            done
        );
    });
});
