const path = require('path');

const PluginDependency = require('../../models/pluginDependency');
const Book = require('../../models/book');
const NodeFS = require('../../fs/node');
const installPlugin = require('../installPlugin');

const Parse = require('../../parse');

describe('installPlugin', function() {
    let book;

    this.timeout(30000);

    before(function() {
        const fs = NodeFS(path.resolve(__dirname, '../../../'));
        const baseBook = Book.createForFS(fs);

        return Parse.parseConfig(baseBook)
        .then(function(_book) {
            book = _book;
        });
    });

    it('must install a plugin from NPM', function() {
        const dep = PluginDependency.createFromString('ga');
        return installPlugin(book, dep);
    });
});
