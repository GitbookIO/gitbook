const extend = require('extend');

const Promise = require('../../utils/promise');
const getPDFTemplate = require('./getPDFTemplate');
const getCoverPath = require('./getCoverPath');

/**
    Generate options for ebook-convert

    @param {Output}
    @return {Promise<Object>}
*/
function getConvertOptions(output) {
    const options = output.getOptions();
    const format = options.get('format');

    const book = output.getBook();
    const config = book.getConfig();

    return Promise()
    .then(function() {
        const coverPath = getCoverPath(output);
        let options = {
            '--cover':                      coverPath,
            '--title':                      config.getValue('title'),
            '--comments':                   config.getValue('description'),
            '--isbn':                       config.getValue('isbn'),
            '--authors':                    config.getValue('author'),
            '--language':                   book.getLanguage() || config.getValue('language'),
            '--book-producer':              'GitBook',
            '--publisher':                  'GitBook',
            '--chapter':                    'descendant-or-self::*[contains(concat(\' \', normalize-space(@class), \' \'), \' book-chapter \')]',
            '--level1-toc':                 'descendant-or-self::*[contains(concat(\' \', normalize-space(@class), \' \'), \' book-chapter-1 \')]',
            '--level2-toc':                 'descendant-or-self::*[contains(concat(\' \', normalize-space(@class), \' \'), \' book-chapter-2 \')]',
            '--level3-toc':                 'descendant-or-self::*[contains(concat(\' \', normalize-space(@class), \' \'), \' book-chapter-3 \')]',
            '--max-levels':                 '1',
            '--no-chapters-in-toc':         true,
            '--breadth-first':              true,
            '--dont-split-on-page-breaks':  format === 'epub' ? true : undefined
        };

        if (format !== 'pdf') {
            return options;
        }

        return Promise.all([
            getPDFTemplate(output, 'header'),
            getPDFTemplate(output, 'footer')
        ])
        .spread(function(headerTpl, footerTpl) {
            const pdfOptions = config.getValue('pdf').toJS();

            return options = extend(options, {
                '--chapter-mark':           String(pdfOptions.chapterMark),
                '--page-breaks-before':     String(pdfOptions.pageBreaksBefore),
                '--margin-left':            String(pdfOptions.margin.left),
                '--margin-right':           String(pdfOptions.margin.right),
                '--margin-top':             String(pdfOptions.margin.top),
                '--margin-bottom':          String(pdfOptions.margin.bottom),
                '--pdf-default-font-size':  String(pdfOptions.fontSize),
                '--pdf-mono-font-size':     String(pdfOptions.fontSize),
                '--paper-size':             String(pdfOptions.paperSize),
                '--pdf-page-numbers':       Boolean(pdfOptions.pageNumbers),
                '--pdf-sans-family':        String(pdfOptions.fontFamily),
                '--pdf-header-template':    headerTpl,
                '--pdf-footer-template':    footerTpl
            });
        });
    });
}


module.exports = getConvertOptions;
