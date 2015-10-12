var _ = require('lodash');
var path = require('path');
var Q = require('q');
var fs = require('./utils/fs');

var BaseGenerator = function(book) {
    this.book = book;

    Object.defineProperty(this, 'options', {
        get: function () {
            return this.book.options;
        }
    });

    _.bindAll(this);
};

BaseGenerator.prototype.callHook = function(name, data) {
    return this.book.callHook(name, data);
};

// Prepare the genertor
BaseGenerator.prototype.prepare = function() {
    var that = this;

    return that.callHook('init');
};

// Write a parsed file to the output
BaseGenerator.prototype.convertFile = function(input) {
    return Q.reject(new Error('Could not convert '+input));
};

// Copy file to the output (non parsable)
BaseGenerator.prototype.transferFile = function(input) {
    return fs.copy(
        this.book.resolve(input),
        path.join(this.options.output, input)
    );
};

// Copy a folder to the output
BaseGenerator.prototype.transferFolder = function(input) {
    return fs.mkdirp(
        path.join(this.book.options.output, input)
    );
};

// Copy the cover picture
BaseGenerator.prototype.copyCover = function() {
    var that = this;

    return Q.all([
        fs.copy(that.book.resolve('cover.jpg'), path.join(that.options.output, 'cover.jpg')),
        fs.copy(that.book.resolve('cover_small.jpg'), path.join(that.options.output, 'cover_small.jpg'))
    ])
    .fail(function() {
        // If orignaly from multi-lang, try copy from parent
        if (!that.book.isSubBook()) return;

        return Q.all([
            fs.copy(path.join(that.book.parentRoot(), 'cover.jpg'), path.join(that.options.output, 'cover.jpg')),
            fs.copy(path.join(that.book.parentRoot(), 'cover_small.jpg'), path.join(that.options.output, 'cover_small.jpg'))
        ]);
    })
    .fail(function() {
        return Q();
    });
};

// At teh end of the generation
BaseGenerator.prototype.finish = function() {
    return Q.reject(new Error('Could not finish generation'));
};

module.exports = BaseGenerator;
