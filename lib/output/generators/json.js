var Promise = require('../../utils/promise');

var Modifier = require('../');


function JSONGenerator(book) {
    this.book = book;
}


JSONGenerator.prototype.onPage = function(page) {
    return Modifier.HTMLTransformations(page, [
        Modifier.svgToImg(),
        Modifier.svgToPng()
    ])
    .then(function() {


    });
};

JSONGenerator.prototype.onAsset = function(file) {

};

module.exports = JSONGenerator;