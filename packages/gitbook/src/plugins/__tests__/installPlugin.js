const tmp = require('tmp');

const PluginDependency = require('../../models/pluginDependency');
const Book = require('../../models/book');
const NodeFS = require('../../fs/node');
const installPlugin = require('../installPlugin');

const Parse = require('../../parse');

describe('installPlugin', () => {
    let book, dir;

    before(() => {
        dir = tmp.dirSync({ unsafeCleanup: true });
        const fs = NodeFS(dir.name);
        const baseBook = Book.createForFS(fs)
            .setLogLevel('disabled');

        return Parse.parseConfig(baseBook)
        .then((_book) => {
            book = _book;
        });
    });

    after(() => {
        dir.removeCallback();
    });

    it('must install a plugin from NPM', () => {
        const dep = PluginDependency.createFromString('ga');
        return installPlugin(book, dep)
        .then(() => {
            expect(dir.name).toHaveFile('node_modules/gitbook-plugin-ga/package.json');
            expect(dir.name).toNotHaveFile('package.json');
        });
    });

    it('must install a specific version of a plugin', () => {
        const dep = PluginDependency.createFromString('ga@0.2.1');
        return installPlugin(book, dep);
    });
});
