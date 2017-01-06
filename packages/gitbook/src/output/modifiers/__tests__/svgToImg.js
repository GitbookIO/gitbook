const cheerio = require('cheerio');
const tmp = require('tmp');

describe('svgToImg', () => {
    let dir;
    const svgToImg = require('../svgToImg');

    beforeEach(() => {
        dir = tmp.dirSync();
    });

    it('should write svg as a file', () => {
        const $ = cheerio.load('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" version="1.1"><rect width="200" height="100" stroke="black" stroke-width="6" fill="green"/></svg>');

        return svgToImg(dir.name, 'index.html', $)
        .then(() => {
            const $img = $('img');
            const src = $img.attr('src');

            expect(dir.name).toHaveFile(src);
        });
    });
});

