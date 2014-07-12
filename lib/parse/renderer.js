var url = require('url');
var inherits = require('util').inherits;
var links = require('../utils').links;
var codeInclude = require('./code_include');


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
    this.quizIndex = 0;
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
    // Our "fixed" href
    var _href = href;

    // Don't build if it looks malicious
    if (this.options.sanitize && this._unsanitized(href)) {
        return text;
    }

    // Parsed version of the url
    var parsed = url.parse(href);

    var o = this._extra_options;

    // Relative link, rewrite it to point to github repo
    if(links.isRelative(_href)) {
        if (path.extname(parsed.path) == ".md") {
            _href = links.toAbsolute(_href, o.dir || "./", o.outdir || "./");

            if (o.singleFile) {
                _href = "#"+_href;
            } else {
                _href = _href.replace(".md", ".html");
            }
        } else if (o && o.repo && o.dir) {
            href = url.resolve('https://github.com/' + o.repo + '/blob/', [o.dir, _href].join("/"));
            parsed = url.parse(href);
            _href = parsed.href;
        }
    }

    // Generate HTML for link
    var out = '<a href="' + _href + '"';
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
    if(links.isRelative(href) && o && o.dir && o.outdir) {
        // o.dir: directory parent of the file currently in rendering process
        // o.outdir: directory parent from the html output

        _href = links.toAbsolute(_href, o.dir, o.outdir);
    }

    return GitBookRenderer.super_.prototype.image.call(this, _href, title, text);
};

GitBookRenderer.prototype.tablerow = function(content) {
    this.quizRowId += 1;
    return GitBookRenderer.super_.prototype.tablerow(content);
};

var fieldRegex = /^([(\[])([ x])[\])]/;
GitBookRenderer.prototype._createCheckboxAndRadios = function(text) {
    var match = fieldRegex.exec(text);
    if (!match) {
        return text;
    }
    var quizIdentifier = 'quiz-row-' + this.id + '-' + this.quizRowId + '-' + this.quizIndex++;
    var field = "<input name='" + quizIdentifier + "' id='" + quizIdentifier + "' type='";
    field += match[1] === '(' ? "radio" : "checkbox";
    field += match[2] === 'x' ? "' checked/>" : "'/>";
    var splittedText = text.split(fieldRegex);
    var length = splittedText.length;
    var label = '<label class="quiz-label" for="' + quizIdentifier + '">' + splittedText[length - 1] + '</label>';
    return text.replace(fieldRegex, field).replace(splittedText[length - 1], label);
};

GitBookRenderer.prototype.tablecell = function(content, flags) {
    return GitBookRenderer.super_.prototype.tablecell(this._createCheckboxAndRadios(content), flags);
};

GitBookRenderer.prototype.listitem = function(text) {
    return GitBookRenderer.super_.prototype.listitem(this._createCheckboxAndRadios(text));
};

GitBookRenderer.prototype.code = function(code, lang, escaped) {
    return GitBookRenderer.super_.prototype.code.call(
        this,
        // Import code snippets
        codeInclude(code, this._extra_options.dir),
        lang,
        escaped
    );
};

GitBookRenderer.prototype.heading = function(text, level, raw) {
    var id = this.options.headerPrefix + raw.toLowerCase().replace(/[^\w -]+/g, '').replace(/ /g, '-');
    return '<h' + level + ' id="' + id + '">' + text + '</h' + level + '>\n';
};

// Exports
module.exports = GitBookRenderer;
