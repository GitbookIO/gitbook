var cheerio = require('cheerio');
var domSerializer = require('dom-serializer');

// Render a cheerio DOM as html
function renderDOM($, dom, options) {
    if (!dom && $._root && $._root.children) {
        dom = $._root.children;
    }
    options = options|| dom.options || $._options;
    return domSerializer(dom, options);
}

/**

*/
var svgToImg = HTMLModifier('svg', function($svg, $) {
    var content = '<?xml version="1.0" encoding="UTF-8"?>' + renderDOM($, $svg);



});

function svgToImg(page) {
    var $ = cheerio.load(page.content);

}

module.exports = svgToImg;
