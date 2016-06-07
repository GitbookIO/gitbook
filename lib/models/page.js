var Immutable = require('immutable');
var yaml = require('js-yaml');

var File = require('./file');

var Page = Immutable.Record({
    file:           File(),

    // Attributes extracted from the YAML header
    attributes:     Immutable.Map(),

    // Content of the page
    content:        String(),

    // Direction of the text
    dir:            String('ltr')
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

Page.prototype.getDir = function() {
    return this.get('dir');
};

/**
 * Return page as text
 * @return {String}
*/
Page.prototype.toText = function() {
    var attrs = this.getAttributes();
    var content = this.getContent();

    if (attrs.size === 0) {
        return content;
    }

    var frontMatter = '---\n' + yaml.safeDump(attrs.toJS(), { skipInvalid: true }) + '---\n\n';
    return (frontMatter + content);
};

/**
 * Return path of the page
 * @return {String}
*/
Page.prototype.getPath = function() {
    return this.getFile().getPath();
};

/**
 * Create a page for a file
 * @param {File} file
 * @return {Page}
*/
Page.createForFile = function(file) {
    return new Page({
        file: file
    });
};

module.exports = Page;
