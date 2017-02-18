const React  = require('react');
const ImmutablePropTypes = require('react-immutable-proptypes');
const Config = require('../models/Config');

module.exports = {
    ...ImmutablePropTypes,
    dispatch:       React.PropTypes.func,
    I18n:           require('./i18n'),
    Context:        require('./Context'),
    Page:           require('./Page'),
    File:           require('./File'),
    History:        require('./History'),
    Language:       require('./Language'),
    Languages:      require('./Languages'),
    Location:       require('./Location'),
    Readme:         require('./Readme'),
    Summary:        require('./Summary'),
    SummaryPart:    require('./SummaryPart'),
    SummaryArticle: require('./SummaryArticle'),
    Config:         React.PropTypes.instanceOf(Config)
};
