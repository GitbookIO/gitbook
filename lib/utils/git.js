var  Q = require('q');
var _ = require('lodash');
var path = require('path');
var crc = require('crc');
var exec = Q.denodeify(require('child_process').exec);
var URI = require('urijs');
var pathUtil = require('./path');

var fs = require('./fs');

var GIT_PREFIX = 'git+';
var GIT_TMP = null;


// Check if an url is a git dependency url
function checkGitUrl(giturl) {
    return (giturl.indexOf(GIT_PREFIX) === 0);
}

// Validates a SHA in hexadecimal
function validateSha(str) {
    return (/[0-9a-f]{40}/).test(str);
}

// Parse and extract infos
function parseGitUrl(giturl) {
    var ref, uri, fileParts, filepath;

    if (!checkGitUrl(giturl)) return null;
    giturl = giturl.slice(GIT_PREFIX.length);

    uri = new URI(giturl);
    ref = uri.fragment() || 'master';
    uri.fragment(null);

    // Extract file inside the repo (after the .git)
    fileParts =uri.path().split('.git');
    filepath = fileParts.length > 1? fileParts.slice(1).join('.git') : '';
    if (filepath[0] == '/') filepath = filepath.slice(1);

    // Recreate pathname without the real filename
    uri.path(_.first(fileParts)+'.git');

    return {
        host: uri.toString(),
        ref: ref || 'master',
        filepath: filepath
    };
}

// Clone a git repo from a specific ref
function cloneGitRepo(host, ref) {
    var isBranch = false;

    ref = ref || 'master';
    if (!validateSha(ref)) isBranch = true;

    return Q()

    // Create temporary folder to store git repos
    .then(function() {
        if (GIT_TMP) return;
        return fs.tmp.dir()
            .then(function(_tmp) {
                GIT_TMP = _tmp;
            });
    })

    // Return or clone the git repo
    .then(function() {
        // Unique ID for repo/ref combinaison
        var repoId = crc.crc32(host+'#'+ref).toString(16);

        // Absolute path to the folder
        var repoPath = path.resolve(GIT_TMP, repoId);

        return fs.exists(repoPath)
            .then(function(doExists) {
                if (doExists) return;

                // Clone repo
                return exec('git clone '+host+' '+repoPath)
                .then(function() {
                    return exec('git checkout '+ref, { cwd: repoPath });
                });
            })
            .thenResolve(repoPath);
    });
}

// Get file from a git repo
function resolveFileFromGit(giturl) {
    if (_.isString(giturl)) giturl = parseGitUrl(giturl);
    if (!giturl) return Q(null);

    // Clone or get from cache
    return cloneGitRepo(giturl.host, giturl.ref)
    .then(function(repo) {

        // Resolve relative path
        return path.resolve(repo, giturl.filepath);
    });
}

// Return root of git repo from a filepath
function resolveGitRoot(filepath) {
    var relativeToGit, repoId;

    // No git repo cloned, or file is not in a git repository
    if (!GIT_TMP || !pathUtil.isInRoot(GIT_TMP, filepath)) return null;

    // Extract first directory (is the repo id)
    relativeToGit = path.relative(GIT_TMP, filepath);
    repoId = _.first(relativeToGit.split(path.sep));
    if (!repoId) return;

    // Return an absolute file
    return path.resolve(GIT_TMP, repoId);
}


module.exports = {
    checkUrl: checkGitUrl,
    parseUrl: parseGitUrl,
    resolveFile: resolveFileFromGit,
    resolveRoot: resolveGitRoot
};
