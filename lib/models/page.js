var Immutable = require('immutable');

var File = require('./file');

var Page = Immutable.Record({
    file:           File(),

    // Attributes extracted from the YAML header
    attributes:     Immutable.Map(),

    // Content of the page
    content:        String()
});

Page.prototype.getFile = function() {
    return this.get('file');
};

Page.prototype.getAttributes = function() {
    return this.get('attributes');
};

Page.prototype.getContent = function() {
    return this.get('content');
};

/**
    Create a page for a file

    @param {File} file
    @return {Page}
*/
Page.createForFile = function(file) {
    return new Page({
        file: file
    });
};

module.exports = Page;
