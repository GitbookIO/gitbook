const React  = require('react');
const { listOf } = require('react-immutable-proptypes');

const {
    string,
    shape
} = React.PropTypes;

const Article = require('./SummaryArticle');

module.exports = shape({
    title: string.isRequired,
    articles: listOf(Article)
});
