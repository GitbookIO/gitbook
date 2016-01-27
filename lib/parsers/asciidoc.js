var Asciidoctor = require('asciidoctor.js');
var htmlParser = require('./html');

var asciidoctor = Asciidoctor();
var opal = asciidoctor.Opal;

var processor = null;
var useExtensions = true;

if (useExtensions) {
    processor = asciidoctor.Asciidoctor(true);
} else {
    processor = asciidoctor.Asciidoctor();
}


// Convert asciidoc to HTML
function asciidocToHTML(content) {
    var options = opal.hash2(['attributes'], {'attributes': 'showtitle'});
    return processor.$convert(content, options);
}


module.exports = htmlParser.inherits({
    extensions: ['.adoc', '.asciidoc'],
    toHTML: asciidocToHTML
});
