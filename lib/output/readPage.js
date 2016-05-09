var Immutable = require('immutable');
var fm = require('front-matter');
var direction = require('direction');

var Parse = require('../parse');
var File = require('../models/file');
var LocationUtils = require('../utils/location');
var fs = require('../utils/fs');
var Git = require('../utils/git');

/**
    Read a page, using parser for actual file and git for content references

    @param {Output} output
    @param {Page} page
    @param {String} pagePath
    @return {Promise<Page>}
*/
function readPage(output, page, pagePath) {
    var book   = output.getBook();
    var logger = output.getLogger();

    // Page is an actual file
    if (!LocationUtils.isGitUrl(pagePath)) {
        return Parse.parsePage(book, page);
    }

    // Page is a Git content reference
    var git = new Git();
    return git.resolve(pagePath)
    .then(function(gitPath) {
        logger.debug.ln('resolve from git', pagePath, 'to', gitPath);

        //  Read file from absolute path
        return fs.readFile(gitPath)
        .then(function(source) {
            var parsed = fm(source.toString('utf8'));

            // Generate file path for output
            var parsedUrl = Git.parseUrl(pagePath);
            return fs.uniqueFilename(book.getRoot(), parsedUrl.filepath)
            .then(function (filepath) {
                return page.merge({
                    file: File.createWithFilepath(filepath),
                    content: parsed.body,
                    attributes: Immutable.fromJS(parsed.attributes),
                    dir: direction(parsed.body)
                });
            });
        });
    });
}


module.exports = readPage;
