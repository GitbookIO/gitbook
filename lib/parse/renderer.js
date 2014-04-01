var url = require('url');
var inherits = require('util').inherits;

var marked = require('marked');


function GitBookRenderer(options) {
    if(!(this instanceof GitBookRenderer)) {
        return new GitBookRenderer(options);
    }
    GitBookRenderer.super_.call(this, options);
}
inherits(GitBookRenderer, marked.Renderer);

GitBookRenderer.prototype._unsanitized = function(href) {
    var prot = '';
    try {
        prot = decodeURIComponent(unescape(href))
            .replace(/[^\w:]/g, '')
            .toLowerCase();

    } catch (e) {
        return true;
    }

    if(prot.indexOf('javascript:') === 0) {
        return true;
    }

    return false;
};

GitBookRenderer.prototype.link = function(href, title, text) {
    // Don't build if it looks malicious
    if (this.options.sanitize && this._unsanitized(href)) {
        return '';
    }

    // Parsed version of the url
    var parsed = url.parse(href);


    // Generate HTML for link
    var out = '<a href="' + href + '"';
    // Title if no null
    if (title) {
        out += ' title="' + title + '"';
    }
    // Target blank if external
    if(parsed.protocol) {
        out += ' target="_blank"';
    }
    out += '>' + text + '</a>';
    return out;
};

// Exports
module.exports = GitBookRenderer;
