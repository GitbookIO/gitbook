const React  = require('react');
const ImmutablePropTypes = require('react-immutable-proptypes');

module.exports = {
    ...ImmutablePropTypes,
    dispatch:       React.PropTypes.func,
    i18n:           require('./i18n'),
    Context:        require('./Context'),
    Page:           require('./Page'),
    File:           require('./File'),
    Summary:        require('./Summary'),
    SummaryPart:    require('./SummaryPart'),
    SummaryArticle: require('./SummaryArticle')
};
