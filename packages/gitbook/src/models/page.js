const { Record, Map } = require('immutable');
const yaml = require('js-yaml');

const File = require('./file');

const DEFAULTS = {
    file:       File(),
    // Attributes extracted from the YAML header
    attributes: Map(),
    // Content of the page
    content:    String(),
    // Direction of the text
    dir:        String('ltr')
};

class Page extends Record(DEFAULTS) {
    getFile() {
        return this.get('file');
    }

    getAttributes() {
        return this.get('attributes');
    }

    getContent() {
        return this.get('content');
    }

    getDir() {
        return this.get('dir');
    }

    /**
     * Return page as text
     * @return {String}
    */
    toText() {
        const attrs = this.getAttributes();
        const content = this.getContent();

        if (attrs.size === 0) {
            return content;
        }

        const frontMatter = '---\n' + yaml.safeDump(attrs.toJS(), { skipInvalid: true }) + '---\n\n';
        return (frontMatter + content);
    }

    /**
     * Return path of the page
     * @return {String}
    */
    getPath() {
        return this.getFile().getPath();
    }

    /**
     * Create a page for a file
     * @param {File} file
     * @return {Page}
    */
    static createForFile(file) {
        return new Page({
            file
        });
    }
}

module.exports = Page;
