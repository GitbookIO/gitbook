
module.exports = {
    name:                       'website',
    State:                      require('./state'),
    Options:                    require('./options'),
    onInit:                     require('./onInit'),
    onFinish:                   require('./onFinish'),
    onPage:                     require('./onPage'),
    onAsset:                    require('./onAsset'),
    createTemplateEngine:       require('./createTemplateEngine')
};
