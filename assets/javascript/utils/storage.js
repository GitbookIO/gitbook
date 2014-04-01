define(function(){
    /*
     * Simple module for storing data in the browser's local storage
     */
    return {
        set: function(key, value) {
            localStorage[key] = JSON.stringify(value);
        },
        get: function(key, def) {
            try {
                return JSON.parse(localStorage[key]) || def;
            } catch(err) {
                return localStorage[key] || def;
            }
        },
        remove: function(key) {
            localStorage.removeItem(key);
        }
    };
});