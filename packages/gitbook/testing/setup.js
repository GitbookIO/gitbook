const is = require('is');
const path = require('path');
const fs = require('fs');
const expect = require('expect');
const cheerio = require('cheerio');

expect.extend({

    /**
     * Check that a file is created in a directory:
     * expect('myFolder').toHaveFile('hello.md');
     */
    toHaveFile(fileName) {
        const filePath = path.join(this.actual, fileName);
        const exists = fs.existsSync(filePath);

        expect.assert(
            exists,
            'expected %s to have file %s',
            this.actual,
            fileName
        );
        return this;
    },
    toNotHaveFile(fileName) {
        const filePath = path.join(this.actual, fileName);
        const exists = fs.existsSync(filePath);

        expect.assert(
            !exists,
            'expected %s to not have file %s',
            this.actual,
            fileName
        );
        return this;
    },

    /**
     * Check that a value is defined (not null nor undefined)
     */
    toBeDefined() {
        expect.assert(
            !(is.undefined(this.actual) || is.null(this.actual)),
            'expected to be defined'
        );
        return this;
    },

    /**
     * Check that a value is defined (not null nor undefined)
     */
    toNotBeDefined() {
        expect.assert(
            (is.undefined(this.actual) || is.null(this.actual)),
            'expected %s to be not defined',
            this.actual
        );
        return this;
    },

    /**
     * Check that a dom element exists in HTML
     * @param {String} selector
     */
    toHaveDOMElement(selector) {
        const $ = cheerio.load(this.actual);
        const $el = $(selector);

        expect.assert($el.length > 0, 'expected HTML to contains %s', selector);
    }
});

global.expect = expect;
