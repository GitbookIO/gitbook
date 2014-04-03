define(function(){
    var baseKey = "";

    /*
     * Simple module for storing data in the browser's local storage
     */
    return {
        setBaseKey: function(key) {
            baseKey = key;
        },
        set: function(key, value) {
            key = baseKey+":"+key;
            localStorage[key] = JSON.stringify(value);
        },
        get: function(key, def) {
            key = baseKey+":"+key;
            try {
                return JSON.parse(localStorage[key]) || def;
            } catch(err) {
                return localStorage[key] || def;
            }
        },
        remove: function(key) {
            key = baseKey+":"+key;
            localStorage.removeItem(key);
        }
    };
});