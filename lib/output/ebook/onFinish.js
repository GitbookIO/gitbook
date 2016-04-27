var websiteGenerator = require('../website');

/**
    Finish the generation, generate the ebook file using ebook-convert

    @param {Output}
    @return {Output}
*/
function onFinish(output) {
    return websiteGenerator.onFinish(output)
    .then(function(resultOutput) {

        // todo

        return resultOutput;
    });
}

module.exports = onFinish;
