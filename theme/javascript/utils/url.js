define([
    "URIjs/URI"
], function(URI) {
    // Joins path segments.  Preserves initial "/" and resolves ".." and "."
    // Does not support using ".." to go above/outside the root.
    // This means that join("foo", "../../bar") will not resolve to "../bar"
    function join(baseUrl, url) {
        var theUrl = new URI(url);
        if (theUrl.is("relative")) {
            theUrl = theUrl.absoluteTo(baseUrl);
        }
        return theUrl.toString();
    }

    // A simple function to get the dirname of a path
    // Trailing slashes are ignored. Leading slash is preserved.
    function dirname(path) {
        return join(path, "..");
    }

    // test if a path or url is absolute
    function isAbsolute(path) {
        if (!path) return false;

        return (path[0] == "/" || path.indexOf("http://") == 0 || path.indexOf("https://") == 0);
    }

    return {
        dirname: dirname,
        join: join,
        isAbsolute: isAbsolute
    };
})