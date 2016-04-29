var WebsiteGenerator = require('../website');

/**
    Initialize the generator

    @param {Output}
    @return {Output}
*/
function onInit(output) {
    return WebsiteGenerator.onInit(output)
    .then(function(resultOutput) {
        var options = resultOutput.getOptions();

        options = options.set('directoryIndex', false);
        options = options.set('prefix', 'ebook');

        return resultOutput.setOptions(options);
    });
}

module.exports = onInit;
