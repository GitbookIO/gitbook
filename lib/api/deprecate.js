var logged = {};

/**
    Log a deprecated notice

    @param {Book|Output} book
    @param {String} key
    @param {String} message
*/
function logNotice(book, key, message) {
    if (logged[key]) return;

    logged[key] = true;

    var logger = book.getLogger();
    logger.warn.ln(message);
}

/**
    Deprecate a function

    @param {Book|Output} book
    @param {String} key: unique identitifer for the deprecated
    @param {Function} fn
    @param {String} msg: message to print when called
    @return {Function}
*/
function deprecateMethod(book, key, fn, msg) {
    return function() {
        logNotice(book, key, msg);

        return fn.apply(this, arguments);
    };
}

/**
    Deprecate a property of an object

    @param {Book|Output} book
    @param {String} key: unique identitifer for the deprecated
    @param {Object} instance
    @param {String} property
    @param {String} msg: message to print when called
    @return {Function}
*/
function deprecateField(book, key, instance, property, value, msg) {
    var getter = function(){
        logNotice(book, key, msg);
        return value;
    };
    var setter = function(v) {
        logNotice(book, key, msg);
        value = v;
        return value;
    };

    Object.defineProperty(instance, property, {
        get: getter,
        set: setter,
        enumerable: true
    });
}

module.exports = {
    method: deprecateMethod,
    field: deprecateField
};
