var should = require('should');
var mock = require('./mock');
var validator = require('../lib/config/validator');

describe('Configuration', function() {

    describe('Validation', function() {
        it('should merge default', function() {
            validator.validate({}).should.have.property('gitbook').which.equal('*');
        });

        it('should throw error for invalid configuration', function() {
            should.throws(function() {
                validator.validate({
                    direction: 'invalid'
                });
            });
        });

        it('should not throw error for non existing configuration', function() {
            validator.validate({
                style: {
                    'pdf': 'test.css'
                }
            });
        });

        it('should validate plugins as an array', function() {
            validator.validate({
                plugins: ['hello']
            });
        });

        it('should validate plugins as a string', function() {
            validator.validate({
                plugins: 'hello,world'
            });
        });

    });

    describe('No configuration', function() {
        var book;

        before(function() {
            return mock.setupDefaultBook()
            .then(function(_book) {
                book = _book;
                return book.prepareConfig();
            });
        });

        it('should signal that configuration is not defined', function() {
            book.config.exists().should.not.be.ok();
        });
    });

    describe('JSON file', function() {
        var book;

        before(function() {
            return mock.setupDefaultBook({
                'book.json': { title: 'Hello World' }
            })
            .then(function(_book) {
                book = _book;
                return book.prepareConfig();
            });
        });

        it('should correctly extend configuration', function() {
            book.config.get('title', '').should.equal('Hello World');
        });
    });

    describe('JS file', function() {
        var book;

        before(function() {
            return mock.setupDefaultBook({
                'book.js': 'module.exports = { title: "Hello World" };'
            })
            .then(function(_book) {
                book = _book;
                return book.prepareConfig();
            });
        });

        it('should correctly extend configuration', function() {
            book.config.get('title', '').should.equal('Hello World');
        });
    });
});

