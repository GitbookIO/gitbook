const ImmutablePropTypes = require('react-immutable-proptypes');

module.exports = {
    ...ImmutablePropTypes,
    Page:           require('./Page'),
    File:           require('./File'),
    Summary:        require('./Summary'),
    SummaryPart:    require('./SummaryPart'),
    SummaryArticle: require('./SummaryArticle')
};
