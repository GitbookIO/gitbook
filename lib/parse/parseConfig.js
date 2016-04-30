var Promise = require('../utils/promise');
var Config = require('../models/config');

var File = require('../models/file');
var validateConfig = require('./validateConfig');
var CONFIG_FILES = require('../constants/configFiles');

/**
    Parse configuration from "book.json" or "book.js"

    @param {Book} book
    @return {Promise<Book>}
*/
function parseConfig(book) {
    var fs = book.getFS();

    return Promise.some(CONFIG_FILES, function(filename) {
        // Is this file ignored?
        if (book.isFileIgnored(filename)) {
            return;
        }

        // Try loading it
        return Promise.all([
            fs.loadAsObject(filename),
            fs.statFile(filename)
        ])
        .spread(function(cfg, file) {
            return {
                file: file,
                values: cfg
            };
        })
        .fail(function(err) {
            if (err.code != 'MODULE_NOT_FOUND') throw(err);
            else return Promise(false);
        });
    })

    .then(function(result) {
        var file = result? result.file : File();
        var values = result? result.values : {};

        values = validateConfig(values);

        var config = Config.create(file, values);
        return book.set('config', config);
    });
}

module.exports = parseConfig;
