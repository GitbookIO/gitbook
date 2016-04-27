var websiteGenerator = require('../website');

/**
    Finish the generation, generate the ebook file using ebook-convert

    @param {Output}
    @return {Output}
*/
function onFinish(output) {
    return websiteGenerator.onFinish(output)
    .then(function(resultOutput) {

        // todo:
        // - render SUMMARY.html
        // - Build ebook using ebook-convert

        return resultOutput;
    });
}

module.exports = onFinish;
