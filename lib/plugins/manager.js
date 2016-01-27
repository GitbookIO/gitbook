
var BookPlugin = require('./plugin');

function PluginsManager(book) {
    this.book = book;
    this.plugins = [];
}


module.exports = PluginsManager;
