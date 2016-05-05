var Promise = require('../utils/promise');
var error = require('../utils/error');
var render = require('./render');

/**
    Render a template

    @param {TemplateEngine} engine
    @param {String} filePath
    @param {Object} context
    @return {Promise<TemplateOutput>}
*/
function renderTemplateFile(engine, filePath, context) {
    var loader = engine.getLoader();

    return Promise()
    .then(function() {
        if (!loader.async) {
            return loader.getSource(filePath);
        }

        var deferred = Promise.defer();
        loader.getSource(filePath, deferred.makeNodeResolver());
        return deferred.promise;
    })
    .then(function(result) {
        if (!result) {
            throw error.TemplateError(new Error('Not found'), {
                filename: filePath
            });
        }

        return render(engine, result.path, result.src, context);
    });

}

module.exports = renderTemplateFile;
