var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var swig_i18n = require('swig-i18n');

var translation_files = fs.readdirSync(__dirname);

var i18n_tags = {};

translation_files.forEach(function (translation_file) {
    // skip me
    if (translation_file == 'index.js') {
        return;
    }

    var lang = path.basename(translation_file, '.json');
    var tags = require('./' + translation_file);

    // add translations to i18n_tags
    _.forIn(tags, function(translation, tag) {
        if (!_.isPlainObject(i18n_tags[tag])) {
            i18n_tags[tag] = {}
        }

        i18n_tags[tag][lang] = translation;
    });
});

swig_i18n.init(i18n_tags);
