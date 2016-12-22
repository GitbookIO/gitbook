const React = require('react');
const Head = require('react-helmet');
const ReactRedux = require('react-redux');

/**
 * Resolve a file url to a relative url in current state
 * @param  {String} href
 * @param  {State} state
 * @return {String}
 */
function resolveForCurrentFile(href, state) {
    const { file } = state;
    return file.relative(href);
}

const ImportLink = ReactRedux.connect((state, {rel, href}) => {
    href = resolveForCurrentFile(href, state);

    return {
        link: [
            {
                rel,
                href
            }
        ]
    };
})(Head);

const ImportScript = ReactRedux.connect((state, {type, src}) => {
    src = resolveForCurrentFile(src, state);

    return {
        script: [
            {
                type,
                src
            }
        ]
    };
})(Head);

const ImportCSS = props => <ImportLink rel="stylesheet" {...props} />;

module.exports = {
    ImportLink,
    ImportScript,
    ImportCSS
};
