const React = require('react');
const Head = require('react-helmet');
const ReactRedux = require('react-redux');

const ImportLink = ReactRedux.connect((state, {rel, href}) => {
    href = href; // TODO: resolve using current page

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
    src = src; // TODO: resolve using current page

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
