/* eslint-disable no-use-before-define */

const React = require('react');
const { list } = require('react-immutable-proptypes');

const {
    string,
    number,
    shape
} = React.PropTypes;

const Article = shape({
    title:    string.isRequired,
    depth:    number.isRequired,
    path:     string,
    url:      string,
    ref:      string,
    level:    string,
    articles: list
});

module.exports = Article;
