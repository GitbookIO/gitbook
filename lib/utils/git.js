var _ = require('lodash');
var path = require('path');
var crc = require('crc');
var URI = require('urijs');

var pathUtil = require('./path');
var Promise = require('./promise');
var command = require('./command');

var GIT_PREFIX = 'git+';

function Git(tmpDir) {
    this.tmpDir = tmpDir;
    this.cloned = {};
}

// Return an unique ID for a combinaison host/ref
Git.prototype.repoID = function(host, ref) {
    return crc.crc32(host+'#'+(ref || '')).toString(16);
};

// Clone a git repository if non existant
Git.prototype.clone = function(host, ref) {
    var that = this;

    return Promise()

    // Return or clone the git repo
    .then(function() {
        // Unique ID for repo/ref combinaison
        var repoId = that.repoID(host, ref);

        // Absolute path to the folder
        var repoPath = path.join(that.tmpDir, repoId);

        if (that.cloned[repoId]) return repoPath;

        // Clone repo
        return command.exec('git clone '+host+' '+repoPath)

        // Checkout reference if specified
        .then(function() {
            that.cloned[repoId] = true;

            if (!ref) return;
            return command.exec('git checkout '+ref, { cwd: repoPath });
        })
        .thenResolve(repoPath);
    });
};

// Get file from a git repo
Git.prototype.resolve = function(giturl) {
    if (_.isString(giturl)) giturl = Git.parseUrl(giturl);
    if (!giturl) return Promise(null);

    // Clone or get from cache
    return this.clone(giturl.host, giturl.ref)
    .then(function(repo) {
        return path.resolve(repo, giturl.filepath);
    });
};

// Return root of git repo from a filepath
Git.prototype.resolveRoot = function(filepath) {
    var relativeToGit, repoId;

    // No git repo cloned, or file is not in a git repository
    if (!pathUtil.isInRoot(this.tmpDir, filepath)) return null;

    // Extract first directory (is the repo id)
    relativeToGit = path.relative(this.tmpDir, filepath);
    repoId = _.first(relativeToGit.split(path.sep));
    if (!repoId) return;

    // Return an absolute file
    return path.resolve(this.tmpDir, repoId);
};

// Check if an url is a git dependency url
Git.isUrl = function(giturl) {
    return (giturl.indexOf(GIT_PREFIX) === 0);
};

// Parse and extract infos
Git.parseUrl = function(giturl) {
    var ref, uri, fileParts, filepath;

    if (!Git.isUrl(giturl)) return null;
    giturl = giturl.slice(GIT_PREFIX.length);

    uri = new URI(giturl);
    ref = uri.fragment() || null;
    uri.fragment(null);

    // Extract file inside the repo (after the .git)
    fileParts = uri.path().split('.git');
    filepath = fileParts.length > 1? fileParts.slice(1).join('.git') : '';
    if (filepath[0] == '/') filepath = filepath.slice(1);

    // Recreate pathname without the real filename
    uri.path(_.first(fileParts)+'.git');

    return {
        host: uri.toString(),
        ref: ref,
        filepath: filepath
    };
};

module.exports = Git;
