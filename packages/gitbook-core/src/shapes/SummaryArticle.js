/* eslint-disable no-use-before-define */

const React  = require('react');
const {
    arrayOf,
    string,
    number,
    shape
} = React.PropTypes;

const Article = shape({
    title:    string.isRequired,
    depth:    number.isRequired,
    path:     string,
    ref:      string,
    level:    string,
    articles: arrayOf(Article)
});

module.exports = Article;
