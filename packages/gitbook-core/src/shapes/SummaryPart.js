const React  = require('react');
const {
    arrayOf,
    string,
    shape
} = React.PropTypes;

const Article = require('./SummaryArticle');

module.exports = shape({
    title: string.isRequired,
    articles: arrayOf(Article)
});
