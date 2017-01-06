const is = require('is');
const path = require('path');
const crc = require('crc');
const URI = require('urijs');

const pathUtil = require('./path');
const Promise = require('./promise');
const command = require('./command');
const fs = require('./fs');

const GIT_PREFIX = 'git+';

class Git {
    constructor() {
        this.tmpDir = null;
        this.cloned = {};
    }

    // Return an unique ID for a combinaison host/ref
    repoID(host, ref) {
        return crc.crc32(host + '#' + (ref || '')).toString(16);
    }

    // Allocate a temporary folder for cloning repos in it
    allocateDir() {
        const that = this;

        if (this.tmpDir) {
            return Promise();
        }

        return fs.tmpDir()
        .then((dir) => {
            that.tmpDir = dir;
        });
    }

    /**
     * Clone a git repository if non existant
     * @param {String} host: url of the git repository
     * @param {String} ref: branch/commit/tag to checkout
     * @return {Promise<String>} repoPath
     */
    clone(host, ref) {
        const that = this;

        return this.allocateDir()

        // Return or clone the git repo
        .then(() => {
            // Unique ID for repo/ref combinaison
            const repoId = that.repoID(host, ref);

            // Absolute path to the folder
            const repoPath = path.join(that.tmpDir, repoId);

            if (that.cloned[repoId]) return repoPath;

            // Clone repo
            return command.exec('git clone ' + host + ' ' + repoPath)

            // Checkout reference if specified
            .then(() => {
                that.cloned[repoId] = true;

                if (!ref) return;
                return command.exec('git checkout ' + ref, { cwd: repoPath });
            })
            .thenResolve(repoPath);
        });
    }

    /**
     * Resole a git url, clone the repo and return the path to the right file.
     * @param {String} giturl
     * @return {Promise<String>} filePath
     */
    resolve(giturl) {
        // Path to a file in a git repo?
        if (!Git.isUrl(giturl)) {
            if (this.resolveRoot(giturl)) return Promise(giturl);
            return Promise(null);
        }
        if (is.string(giturl)) giturl = Git.parseUrl(giturl);
        if (!giturl) return Promise(null);

        // Clone or get from cache
        return this.clone(giturl.host, giturl.ref)
        .then((repo) => {
            return path.resolve(repo, giturl.filepath);
        });
    }

    /**
     * Return root of git repo from a filepath
     * @param  {String} filePath
     * @return {String} repoPath
     */
    resolveRoot(filepath) {
        // No git repo cloned, or file is not in a git repository
        if (!this.tmpDir || !pathUtil.isInRoot(this.tmpDir, filepath)) return null;

        // Extract first directory (is the repo id)
        const relativeToGit = path.relative(this.tmpDir, filepath);
        const repoId = relativeToGit.split(path.sep)[0];

        if (!repoId) {
            return;
        }

        // Return an absolute file
        return path.resolve(this.tmpDir, repoId);
    }

    /**
     * Check if an url is a git dependency url
     * @param  {String} giturl
     * @return {Boolean} isUrl
     */
    static isUrl(giturl) {
        return (giturl.indexOf(GIT_PREFIX) === 0);
    }

    /**
     * Parse and extract infos
     * @param  {String} giturl
     * @return {Object} { host, ref, filepath }
     */
    static parseUrl(giturl) {
        if (!Git.isUrl(giturl)) {
            return null;
        }
        giturl = giturl.slice(GIT_PREFIX.length);

        const uri = new URI(giturl);
        const ref = uri.fragment() || null;
        uri.fragment(null);

        // Extract file inside the repo (after the .git)
        const fileParts = uri.path().split('.git');
        let filepath = fileParts.length > 1 ? fileParts.slice(1).join('.git') : '';
        if (filepath[0] == '/') {
            filepath = filepath.slice(1);
        }

        // Recreate pathname without the real filename
        uri.path(fileParts[0] + '.git');

        return {
            host: uri.toString(),
            ref,
            filepath
        };
    }

}

module.exports = Git;
