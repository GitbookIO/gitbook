const Promise = require('../utils/promise');
const error = require('../utils/error');
const render = require('./render');

/**
 * Render a template
 *
 * @param {TemplateEngine} engine
 * @param {String} filePath
 * @param {Object} context
 * @return {Promise<TemplateOutput>}
 */
function renderTemplateFile(engine, filePath, context) {
    const loader = engine.getLoader();

    // Resolve the filePath
    const resolvedFilePath = loader.resolve(null, filePath);

    return Promise()
    .then(() => {
        if (!loader.async) {
            return loader.getSource(resolvedFilePath);
        }

        const deferred = Promise.defer();
        loader.getSource(resolvedFilePath, deferred.makeNodeResolver());
        return deferred.promise;
    })
    .then((result) => {
        if (!result) {
            throw error.TemplateError(new Error('Not found'), {
                filename: filePath
            });
        }

        return render(engine, result.path, result.src, context);
    });

}

module.exports = renderTemplateFile;
