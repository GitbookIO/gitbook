var baseKey = '';

/*
 * Simple module for storing data in the browser's local storage
 */
module.exports = {
    setBaseKey: function(key) {
        baseKey = key;
    },

    // Write something in localstorage
    set: function(key, value) {
        key = baseKey+':'+key;

        try {
            localStorage[key] = JSON.stringify(value);
        } catch(e) {}
    },

    // Read a value from localstorage
    get: function(key, def) {
        key = baseKey+':'+key;
        if (localStorage[key] === undefined) return def;
        try {
            var v = JSON.parse(localStorage[key]);
            return v == null ? def : v;;
        } catch(err) {
            return localStorage[key] || def;
        }
    },

    // Remove a key from localstorage
    remove: function(key) {
        key = baseKey+':'+key;
        localStorage.removeItem(key);
    }
};
