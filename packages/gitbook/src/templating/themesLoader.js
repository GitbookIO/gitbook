const Immutable = require('immutable');
const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');

const PathUtils = require('../utils/path');


const ThemesLoader = nunjucks.Loader.extend({
    init(searchPaths) {
        this.searchPaths = Immutable.List(searchPaths)
            .map(path.normalize);
    },

    /**
     * Read source of a resolved filepath
     * @param {String}
     * @return {Object}
     */
    getSource(fullpath) {
        if (!fullpath) return null;

        fullpath = this.resolve(null, fullpath);
        const templateName = this.getTemplateName(fullpath);

        if (!fullpath) {
            return null;
        }

        let src = fs.readFileSync(fullpath, 'utf-8');

        src = '{% do %}var template = template || {}; template.stack = template.stack || []; template.stack.push(template.self); template.self = ' + JSON.stringify(templateName) + '{% enddo %}\n' +
            src +
            '\n{% do %}template.self = template.stack.pop();{% enddo %}';

        return {
            src,
            path: fullpath,
            noCache: true
        };
    },

    /**
     * Nunjucks calls "isRelative" to determine when to call "resolve".
     * We handle absolute paths ourselves in ".resolve" so we always return true
     */
    isRelative() {
        return true;
    },

    /**
     * Get original search path containing a template
     * @param {String} filepath
     * @return {String} searchPath
     */
    getSearchPath(filepath) {
        return this.searchPaths
            .sortBy(function(s) {
                return -s.length;
            })
            .find(function(basePath) {
                return (filepath && filepath.indexOf(basePath) === 0);
            });
    },

    /**
     * Get template name from a filepath
     * @param {String} filepath
     * @return {String} name
     */
    getTemplateName(filepath) {
        const originalSearchPath = this.getSearchPath(filepath);
        return originalSearchPath ? path.relative(originalSearchPath, filepath) : null;
    },

    /**
     * Resolve a template from a current template
     * @param {String|null} from
     * @param {String} to
     * @return {String|null}
     */
    resolve(from, to) {
        let searchPaths = this.searchPaths;

        // Relative template like "./test.html"
        if (PathUtils.isPureRelative(to) && from) {
            return path.resolve(path.dirname(from), to);
        }

        // Determine in which search folder we currently are
        const originalSearchPath = this.getSearchPath(from);
        const originalFilename = this.getTemplateName(from);

        // If we are including same file from a different search path
        // Slice the search paths to avoid including from previous ones
        if (originalFilename == to) {
            const currentIndex = searchPaths.indexOf(originalSearchPath);
            searchPaths = searchPaths.slice(currentIndex + 1);
        }

        // Absolute template to resolve in root folder
        const resultFolder = searchPaths.find(function(basePath) {
            const p = path.resolve(basePath, to);

            return (
                p.indexOf(basePath) === 0
                && fs.existsSync(p)
            );
        });
        if (!resultFolder) return null;
        return path.resolve(resultFolder, to);
    }
});

module.exports = ThemesLoader;
