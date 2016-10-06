const path = require('path');
const url = require('url');
const { Record, Map } = require('immutable');
const LocationUtils = require('../utils/location');

/*
    The URIIndex stores a map of filename to url.
    To resolve urls for each article.
 */

const DEFAULTS = {
    uris: Map()
};

/**
 * Modify an url path while preserving the hash
 * @param {String} input
 * @param {Function<String>} transform
 * @return {String} output
 */
function transformURLPath(input, transform) {
    // Split anchor
    const parsed = url.parse(input);
    input = parsed.pathname || '';

    input = transform(input);

    // Add back anchor
    input = input + (parsed.hash || '');

    return input;
}

class URIIndex extends Record(DEFAULTS) {
    constructor(index) {
        super({
            uris: Map(index)
                .mapKeys(key => LocationUtils.normalize(key))
        });
    }

    /**
     * Append a file to the index
     * @param {String} filePath
     * @param {String} url
     * @return {URIIndex}
     */
    append(filePath, uri) {
        const { uris } = this;
        filePath = LocationUtils.normalize(filePath);

        return this.merge({
            uris: uris.set(filePath, uri)
        });
    }

    /**
     * Resolve an absolute file path to an url.
     *
     * @param {String} filePath
     * @return {String} url
     */
    resolve(filePath) {
        if (LocationUtils.isExternal(filePath)) {
            return filePath;
        }

        return transformURLPath(filePath, (href) => {
            const { uris } = this;
            href = LocationUtils.normalize(href);

            return uris.get(href, href);
        });
    }

    /**
     * Resolve a filename to an url, considering that the link to "filePath"
     * in the file "originPath".
     *
     * For example if we are generating doc/README.md and we have a link "/READNE.md":
     * index.resolveFrom('doc/README.md', '/README.md') === '../index.html'
     *
     * @param {String} filePath
     * @return {String} url
     */
    resolveFrom(originPath, filePath) {
        if (LocationUtils.isExternal(filePath)) {
            return filePath;
        }

        const originURL = this.resolve(originPath);
        const originDir = path.dirname(originPath);
        const originOutDir = path.dirname(originURL);

        return transformURLPath(filePath, (href) => {
            if (!href) {
                return href;
            }
            // Calcul absolute path for this
            href = LocationUtils.toAbsolute(href, originDir, '.');

            // Resolve file
            href = this.resolve(href);

            // Convert back to relative
            href = LocationUtils.relative(originOutDir, href);

            return href;
        });
    }

}

module.exports = URIIndex;
