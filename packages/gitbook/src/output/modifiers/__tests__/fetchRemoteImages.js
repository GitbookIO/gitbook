const cheerio = require('cheerio');
const tmp = require('tmp');
const path = require('path');

const URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png';

describe('fetchRemoteImages', () => {
    let dir;
    const fetchRemoteImages = require('../fetchRemoteImages');

    beforeEach(() => {
        dir = tmp.dirSync();
    });

    it('should download image file', () => {
        const $ = cheerio.load('<img src="' + URL + '" />');

        return fetchRemoteImages(dir.name, 'index.html', $)
        .then(() => {
            const $img = $('img');
            const src = $img.attr('src');

            expect(dir.name).toHaveFile(src);
        });
    });

    it('should download image file and replace with relative path', () => {
        const $ = cheerio.load('<img src="' + URL + '" />');

        return fetchRemoteImages(dir.name, 'test/index.html', $)
        .then(() => {
            const $img = $('img');
            const src = $img.attr('src');

            expect(dir.name).toHaveFile(path.join('test', src));
        });
    });
});

