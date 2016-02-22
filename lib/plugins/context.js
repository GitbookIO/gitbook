var error = require('../utils/error');

/*
    Return the context for a plugin.
    It tries to keep compatibilities with GitBook v2
*/

function pluginCtx(plugin) {
    var book = plugin.book;
    var ctx = {
        config: book.config,
        log: plugin.log,

        // Paths
        resolve: book.resolve
    };

    // Deprecation
    error.deprecateField(ctx, 'options', book.config.dump(), '"options" property is deprecated, use config.get(key) instead');

    // Loop for template filters/blocks
    error.deprecateField(ctx, 'book', ctx, '"book" property is deprecated, use "this" directly instead');

    return ctx;
}

module.exports = pluginCtx;
