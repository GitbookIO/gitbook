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
            if (localStorage[key] === undefined) return def;
            try {
                var v = JSON.parse(localStorage[key]);
                return v == null ? def : v;;
            } catch(err) {
                console.error(err);
                return localStorage[key] || def;
            }
        },
        remove: function(key) {
            key = baseKey+":"+key;
            localStorage.removeItem(key);
        }
    };
});