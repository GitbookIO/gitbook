var slug = require('github-slugid');
var HTMLModifier = require('./html');

var addHeadingID = HTMLModifier('h1,h2,h3,h4,h5,h6', function(heading) {
    if (heading.attr('id')) return;
    heading.attr('id', slug(heading.text()));
});

module.exports = addHeadingID;
