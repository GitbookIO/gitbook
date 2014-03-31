var inherits = require('util').inherits;

var marked = require('marked');


function GitBookRenderer(options) {
    if(!(this instanceof GitBookRenderer)) {
        return new GitBookRenderer(options);
    }
    GitBookRenderer.super_.call(this, options);
}
inherits(GitBookRenderer, marked.Renderer);


GitBookRenderer.prototype.link = function(href, title, text) {
    // Replace .md extensions by .html
    return GitBookRenderer.super_.prototype.link.call(
        this,
        href.replace(/\.md$/, '.html'),
        title,
        text
    );
};


// Exports
module.exports = GitBookRenderer;
