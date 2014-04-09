var url = require('url');
var inherits = require('util').inherits;

var path = require('path');

var marked = require('marked');

var rendererId = 0;

function GitBookRenderer(options, extra_options) {
    if(!(this instanceof GitBookRenderer)) {
        return new GitBookRenderer(options, extra_options);
    }
    GitBookRenderer.super_.call(this, options);

    this._extra_options = extra_options;
    this.quizRowId = 0;
    this.id = rendererId++;
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

    var o = this._extra_options;
    // Relative link, rewrite it to point to github repo
    if(!parsed.protocol && parsed.path && parsed.path[0] != '/' && o && o.repo && o.dir) {
        href = 'https://github.com/' + o.repo + '/blob' + path.normalize(path.join(
            '/',
            o.dir,
            href
        ));
        parsed = url.parse(href);
    }

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

GitBookRenderer.prototype.image = function(href, title, text) {
    // Our "fixed" href
    var _href = href;

    // Parsed version of the url
    var parsed = url.parse(href);

    // Options
    var o = this._extra_options;

    // Relative image, rewrite it depending output
    if(!parsed.protocol && parsed.path && parsed.path[0] != '/' && o && o.dir && o.outdir) {
        _href = path.relative(o.outdir, path.normalize(path.join(
            o.dir,
            href
        )));
    }

    return GitBookRenderer.super_.prototype.image.call(this, _href, title, text);
};

GitBookRenderer.prototype.tablerow = function(content) {
    this.quizRowId += 1;
    return GitBookRenderer.super_.prototype.tablerow(content);
};

GitBookRenderer.prototype.tablecell = function(content, flags) {
    var radioContent = content;
    if (content === "( )") {
        radioContent = "<input type='radio' name='quiz-row-" + this.id + "-" + this.quizRowId + "'/>";
    } else if (content === "(x)") {
        radioContent = "<input type='radio' name='quiz-row-" + this.id + "-" + this.quizRowId + "' checked/>";
    }
    return GitBookRenderer.super_.prototype.tablecell(radioContent, flags);
};

// Exports
module.exports = GitBookRenderer;
